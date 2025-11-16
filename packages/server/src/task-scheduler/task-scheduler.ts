import { Command, RegularTask, type Events } from "@ynab-plus/domain";
import type { IEventBus, IServiceBus } from "@ynab-plus/app";
import type { ILogger } from "@ynab-plus/bootstrap";
import cron from "node-cron";
import { WebAppError } from "../websocker-server/web-app-error.ts";

const LOG_CONTEXT = { context: "start-scheduler" };

export class TaskScheduler {
  private _taskMap: Map<string, cron.ScheduledTask> | undefined;

  public constructor(
    private serviceBus: IServiceBus,
    private logger: ILogger,
    private eventBus: IEventBus,
  ) {
    this.eventBus.on("ScheduledTaskDeleted", this.onDelete.bind(this));
    this.eventBus.on("ScheduledTaskCreated", this.onCreate.bind(this));
    this.eventBus.on("ScheduledTaskDeleted", this.onCreate.bind(this));
  }

  public async initialise() {
    this.logger.info(`Getting existing scheduled tasks`, LOG_CONTEXT);

    const command = new Command("ListScheduledTasksCommand", {
      offset: 0,
      limit: undefined,
    });

    const tasks =
      await this.serviceBus.handleCommand<"ListScheduledTasksCommand">(command);

    this._taskMap = new Map<string, cron.ScheduledTask>(
      tasks.map((task) => [task.id, this.makeCronTask(task, this.serviceBus)]),
    );
  }

  private get taskMap() {
    if (!this._taskMap) {
      throw new WebAppError(`Please initialise scheduler first`);
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
      this.taskMap.set(data.id, this.makeCronTask(data, this.serviceBus));
    }
  }

  public onCreate(data: Events["ScheduledTaskCreated"]) {
    this.taskMap.set(data.id, this.makeCronTask(data, this.serviceBus));
  }

  private makeCronTask(task: RegularTask, serviceBus: IServiceBus) {
    return cron.createTask(task.getCronString(), async () => {
      const command = task.getCommand();
      await serviceBus.handleCommand(command);
    });
  }
}
