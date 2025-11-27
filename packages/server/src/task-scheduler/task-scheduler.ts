import {
  Command,
  RegularTask,
  SystemContext,
  User,
  type Commands,
  type IRole,
} from "@ynab-plus/domain";
import {
  EventBusToken,
  ServiceBusToken,
  type AllEvents,
  type IEventBus,
  type IServiceBus,
} from "@ynab-plus/app";
import { AbstractError, LoggerToken, type ILogger } from "@ynab-plus/bootstrap";
import cron from "node-cron";
import { ServerError } from "@core";
import { inject, injectable } from "inversify";

const LOG_CONTEXT = { context: "task-scheduler" };

const TASK_SCHEDULER_CONTEXT_NAME = "Task Scheduler";

@injectable()
export class TaskScheduler {
  private _taskMap:
    | Map<string, { cronTask: cron.ScheduledTask; appTask: RegularTask }>
    | undefined;

  public constructor(
    @inject(ServiceBusToken)
    private serviceBus: IServiceBus,

    @inject(EventBusToken)
    private eventBus: IEventBus,

    @inject(LoggerToken)
    private logger: ILogger,
  ) {}

  public async executeCommand<
    TKey extends keyof Commands = keyof Commands,
    TRole extends IRole = User,
  >(command: Command<TKey, TRole>): Promise<Commands[TKey]["response"]> {
    try {
      return await this.serviceBus.execute<TKey, TRole>(command);
    } catch (error) {
      if (error instanceof AbstractError) {
        this.logger.error(
          `${error.message}, ${String(error.stack)}`,
          LOG_CONTEXT,
        );
        error.handle(this.eventBus);
        return;
      } else if (error instanceof Error) {
        this.logger.error(
          `${error.message}, ${String(error.stack)}`,
          LOG_CONTEXT,
        );
        return;
      } else {
        this.logger.error(String(error), LOG_CONTEXT);
        return;
      }
    }
  }

  public async initialise() {
    this.logger.info(`Getting existing scheduled tasks`, LOG_CONTEXT);

    const command = new Command(
      "ListScheduledTasksCommand",
      {
        offset: 0,
        limit: undefined,
      },
      new SystemContext(TASK_SCHEDULER_CONTEXT_NAME, ["system"]),
    );

    const tasks = await this.executeCommand(command);

    const taskOrTasks = tasks.length > 1 ? `tasks` : `task`;

    this.logger.info(
      `Found ${String(tasks.length)} ${taskOrTasks} scheduled tasks`,
      LOG_CONTEXT,
    );

    this._taskMap = new Map<
      string,
      { cronTask: cron.ScheduledTask; appTask: RegularTask }
    >(
      await Promise.all(
        tasks.map(
          async (task) => [task.id, await this.makeCronTask(task)] as const,
        ),
      ),
    );

    this.eventBus.on("RegularTaskDeleted", this.onDelete.bind(this));
    this.eventBus.on("RegularTaskCreated", this.onCreate.bind(this));
    this.eventBus.on("RegularTaskUpdated", this.onUpdate.bind(this));
  }

  private get taskMap() {
    if (!this._taskMap) {
      throw new ServerError(`Please initialise scheduler first`);
    }
    return this._taskMap;
  }

  public async onDelete(data: AllEvents["RegularTaskDeleted"]) {
    const toDelete = this.taskMap.get(data.id);
    if (toDelete) {
      this.logger.debug(`Deleting scheduled task ${data.id}`, LOG_CONTEXT);
      await toDelete.cronTask.destroy();
      this.taskMap.delete(data.id);
    }
  }

  public async onUpdate(data: AllEvents["RegularTaskUpdated"]) {
    const toUpdate = this.taskMap.get(data.old.id);
    if (toUpdate) {
      this.logger.debug(`Updating scheduled task ${data.old.id}`, LOG_CONTEXT);
      if (!data.old.executionDetailsAreEqual(toUpdate.appTask)) {
        await toUpdate.cronTask.destroy();
        this.taskMap.set(data.old.id, await this.makeCronTask(data.new));
      } else {
        this.taskMap.set(data.old.id, {
          cronTask: toUpdate.cronTask,
          appTask: data.new,
        });
      }
    }
  }

  public async onCreate(data: AllEvents["RegularTaskCreated"]) {
    this.taskMap.set(data.id, await this.makeCronTask(data));
  }

  private async getTaskOwner(task: RegularTask) {
    if (typeof task.onBehalfOf === "undefined") {
      return undefined;
    }
    const getUserCommand = new Command(
      "GetUserCommand",
      { username: task.onBehalfOf },
      new SystemContext(TASK_SCHEDULER_CONTEXT_NAME, ["system"]),
    );

    return await this.executeCommand(getUserCommand);
  }

  private async executeTask(task: RegularTask, owner: User | undefined) {
    this.logger.debug(`Firing scheduled task ${task.id}`, LOG_CONTEXT);

    const context = new SystemContext(
      TASK_SCHEDULER_CONTEXT_NAME,
      ["system"],
      owner,
    );

    const command = task.getCommand(context);
    await this.executeCommand(command);

    task.updateTask({
      lastExecution: new Date(),
    });

    const updateTaskCommand = new Command(
      "UpdateScheduledTaskCommand",
      task,
      context,
    );

    await this.executeCommand(updateTaskCommand);
  }

  private async makeCronTask(task: RegularTask) {
    this.logger.debug(
      `Registering task ${task.id} with node-cron`,
      LOG_CONTEXT,
    );
    const owner = await this.getTaskOwner(task);

    const theTask = {
      cronTask: cron.schedule(task.getCronString(), async () => {
        await this.executeTask(task, owner);
      }),
      appTask: task,
    };

    if (task.triggerImmediately) {
      await theTask.cronTask.execute();
    }

    return theTask;
  }
}
