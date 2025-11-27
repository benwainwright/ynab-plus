import type { ITaskScheduler } from "@ynab-plus/app";
import type { ConfigValue } from "@ynab-plus/bootstrap";
import { RegularTask, schedulableTasksSchema } from "@ynab-plus/domain";
import { SqliteDatabase } from "./sqlite-database.ts";
import { injectable } from "inversify";
import { inject } from "@core";

interface RawTask {
  id: string;
  onBehalfOf: string | undefined;
  lastExecution: string | undefined;
  data: string | undefined;
  created: string;
  minute: string;
  hour: string;
  day: string;
  month: string;
  weekDay: string;
  triggerImmediately: string;
  name: string;
  description: string;
  command: string;
}

@injectable()
export class SqliteRegularTaskRepository implements ITaskScheduler {
  public constructor(
    @inject("TasksTableName")
    private tableName: ConfigValue<string>,

    @inject("SqliteDatabase")
    private database: SqliteDatabase,
  ) {}

  public async updateTask(task: RegularTask): Promise<void> {
    await this.database.getFromDb<RawTask>(
      `UPDATE ${await this.tableName.value}
        SET onBehalfOf = ?,
            lastExecution = ?,
            created = ?,
            minute = ?,
            hour = ?,
            day = ?,
            month = ?,
            weekDay = ?,
            name = ?,
            description = ?,
            command = ?,
            data = ?,
            triggerImmediately = ?
      WHERE id = ?
      RETURNING id, onBehalfOf, lastExecution, created, minute, hour, day, month, weekDay, name, description, command, data, triggerImmediately`,
      [
        task.onBehalfOf,
        task.lastExecution?.toISOString() ?? null,
        task.created.toISOString(),
        task.minute,
        task.hour,
        task.day,
        task.month,
        task.weekDay,
        task.name,
        task.description,
        task.command,
        task.data,
        String(task.triggerImmediately),
        task.id,
      ],
    );
  }

  async create() {
    await this.database.runQuery(
      `CREATE TABLE IF NOT EXISTS ${await this.tableName.value} (
          id TEXT PRIMARY KEY,
          onBehalfOf TEXT,
          lastExecution TEXT,
          created TEXT NOT NULL,
          minute TEXT NOT NULL,
          hour TEXT NOT NULL,
          day TEXT NOT NULL,
          month TEXT NOT NULL,
          weekDay TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          command TEXT NOT NULL,
          triggerImmediately TEXT NOT NULL,
          data TEXT
      );`,
    );
  }

  private mapRaw(raw: RawTask): RegularTask {
    return RegularTask.reconstitute({
      ...raw,
      created: new Date(raw.created),
      lastExecution: raw.lastExecution
        ? new Date(raw.lastExecution)
        : undefined,
      command: schedulableTasksSchema.parse(raw.command),
      data: raw.data ?? undefined,
      onBehalfOf: raw.onBehalfOf ?? undefined,
      triggerImmediately: raw.triggerImmediately === "true",
    });
  }

  public async scheduleTask(task: RegularTask): Promise<RegularTask> {
    const data = await this.database.getFromDb<RawTask>(
      `INSERT INTO ${await this.tableName.value} (id, onBehalfOf, lastExecution, created, minute, hour, day, month, weekDay, name, description, command, data, triggerImmediately)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id, onBehalfOf, lastExecution, created, minute, hour, day, month, weekDay, name, description, command, data, triggerImmediately`,
      [
        task.id,
        task.onBehalfOf,
        task.lastExecution?.toISOString() ?? null,
        task.created.toISOString(),
        task.minute,
        task.hour,
        task.day,
        task.month,
        task.weekDay,
        task.name,
        task.description,
        task.command,
        task.data,
        String(task.triggerImmediately),
      ],
    );
    return this.mapRaw(data);
  }

  public async deleteTask(task: RegularTask): Promise<void> {
    await this.database.runQuery(
      `DELETE FROM ${await this.tableName.value}
      where id = ?`,
      [task.id],
    );
  }

  public async getTask(id: string): Promise<RegularTask | undefined> {
    const result = await this.database.getFromDb<RawTask | undefined>(
      `SELECT id, onBehalfOf, lastExecution, created, minute, hour, day, month, weekDay, name, description, command, data, triggerImmediately
        FROM ${await this.tableName.value}
        WHERE id = ?`,
      [id],
    );

    if (!result) {
      return undefined;
    }

    return this.mapRaw(result);
  }
  public async getTasks(
    offset: number,
    limit?: number,
  ): Promise<RegularTask[]> {
    const result = await this.database.getAllFromDatabase<RawTask[]>(
      `SELECT id, onBehalfOf, lastExecution, created, minute, hour, day, month, weekDay, name, description, command, data, triggerImmediately
        FROM ${await this.tableName.value}
        LIMIT ? OFFSET ?`,
      [limit ?? -1, offset],
    );

    return result.map((result) => this.mapRaw(result));
  }

  public async getUserTasks(
    userId: string,
    offset: number,
    limit: number,
  ): Promise<RegularTask[]> {
    const result = await this.database.getAllFromDatabase<RawTask[]>(
      `SELECT id, onBehalfOf, lastExecution, created, minute, hour, day, month, weekDay, name, description, command, data, triggerImmediately
        FROM ${await this.tableName.value}
        WHERE onBehalfOf = ?
        LIMIT ? OFFSET ?`,
      [userId, limit, offset],
    );

    return result.map((result) => this.mapRaw(result));
  }
}
