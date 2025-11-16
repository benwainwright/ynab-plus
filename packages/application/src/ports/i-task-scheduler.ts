import type { RegularTask } from "@ynab-plus/domain";

export interface ITaskScheduler {
  scheduleTask(task: RegularTask): Promise<RegularTask>;
  updateTask(task: RegularTask): Promise<void>;
  deleteTask(task: RegularTask): Promise<void>;
  getTask(id: string): Promise<RegularTask | undefined>;
  getTasks(offset: number, limit?: number): Promise<RegularTask[]>;
  getUserTasks(
    userId: string,
    offset: number,
    limit: number,
  ): Promise<RegularTask[]>;
}
