import {
  Command,
  RegularTask,
  SystemContext,
  User,
  type Events,
} from "@ynab-plus/domain";
import type { IEventBus, IServiceBus } from "@ynab-plus/app";
import type { ILogger } from "@ynab-plus/bootstrap";
import cron from "node-cron";
import { ServerError } from "@core";

const LOG_CONTEXT = { context: "task-scheduler" };

const TASK_SCHEDULER_CONTEXT_NAME = "Task Scheduler";

export class TaskScheduler {
  private _taskMap:
    | Map<string, { cronTask: cron.ScheduledTask; appTask: RegularTask }>
    | undefined;

  public constructor(
    private serviceBus: IServiceBus,
    private eventBus: IEventBus,
    private logger: ILogger,
  ) {}

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

    const tasks = await this.serviceBus.execute(command);

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

    this.eventBus.on("ScheduledTaskDeleted", this.onDelete.bind(this));
    this.eventBus.on("ScheduledTaskCreated", this.onCreate.bind(this));
    this.eventBus.on("ScheduledTaskUpdated", this.onUpdate.bind(this));
  }

  private get taskMap() {
    if (!this._taskMap) {
      throw new ServerError(`Please initialise scheduler first`);
    }
    return this._taskMap;
  }

  public async onDelete(data: Events["ScheduledTaskDeleted"]) {
    const toDelete = this.taskMap.get(data.id);
    if (toDelete) {
      this.logger.debug(`Deleting scheduled task ${data.id}`, LOG_CONTEXT);
      await toDelete.cronTask.destroy();
      this.taskMap.delete(data.id);
    }
  }

  public async onUpdate(data: Events["ScheduledTaskUpdated"]) {
    const toUpdate = this.taskMap.get(data.id);
    if (toUpdate) {
      this.logger.debug(`Updating scheduled task ${data.id}`, LOG_CONTEXT);
      if (!data.executionDetailsAreEqual(toUpdate.appTask)) {
        await toUpdate.cronTask.destroy();
        this.taskMap.set(data.id, await this.makeCronTask(data));
      } else {
        toUpdate.appTask.description = data.description;
        toUpdate.appTask.name = data.name;
        toUpdate.appTask.lastExecution = data.lastExecution;
      }
    }
  }

  public async onCreate(data: Events["ScheduledTaskCreated"]) {
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

    return await this.serviceBus.execute(getUserCommand);
  }

  private async executeTask(task: RegularTask, owner: User | undefined) {
    this.logger.debug(`Firing scheduled task ${task.id}`, LOG_CONTEXT);

    const context = new SystemContext(
      TASK_SCHEDULER_CONTEXT_NAME,
      ["system"],
      owner,
    );

    const command = task.getCommand(context);
    await this.serviceBus.execute(command);

    task.lastExecution = new Date();

    const updateTaskCommand = new Command(
      "UpdateScheduledTaskCommand",
      task,
      context,
    );

    await this.serviceBus.execute(updateTaskCommand);
  }

  private async makeCronTask(task: RegularTask) {
    this.logger.debug(
      `Registering task ${task.id} with node-cron`,
      LOG_CONTEXT,
    );
    const owner = await this.getTaskOwner(task);

    return {
      cronTask: cron.schedule(task.getCronString(), async () => {
        await this.executeTask(task, owner);
      }),
      appTask: task,
    };
  }
}
