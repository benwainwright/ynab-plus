import {
  Command,
  RegularTask,
  SystemContext,
  type Events,
} from "@ynab-plus/domain";
import type { IEventBus, IServiceBus } from "@ynab-plus/app";
import type { ILogger } from "@ynab-plus/bootstrap";
import cron from "node-cron";
import { ServerError } from "@core";

const LOG_CONTEXT = { context: "start-scheduler" };

const TASK_SCHEDULER_CONTEXT_NAME = "Task Scheduler";

export class TaskScheduler {
  private _taskMap: Map<string, cron.ScheduledTask> | undefined;

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

    this._taskMap = new Map<string, cron.ScheduledTask>(
      await Promise.all(
        tasks.map(
          async (task) => [task.id, await this.makeCronTask(task)] as const,
        ),
      ),
    );

    this.eventBus.on("ScheduledTaskDeleted", this.onDelete.bind(this));
    this.eventBus.on("ScheduledTaskCreated", this.onCreate.bind(this));
    this.eventBus.on("ScheduledTaskDeleted", this.onCreate.bind(this));
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
      await toDelete.destroy();
      this.taskMap.delete(data.id);
    }
  }

  public async onUpdate(data: Events["ScheduledTaskUpdated"]) {
    const toUpdate = this.taskMap.get(data.id);
    if (toUpdate) {
      await toUpdate.destroy();
      this.taskMap.set(data.id, await this.makeCronTask(data));
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

  private async makeCronTask(task: RegularTask) {
    const owner = await this.getTaskOwner(task);
    return cron.createTask(task.getCronString(), async () => {
      const context = new SystemContext(
        TASK_SCHEDULER_CONTEXT_NAME,
        ["system"],
        owner,
      );
      const command = task.getCommand(context);
      await this.serviceBus.execute(command);
    });
  }
}
