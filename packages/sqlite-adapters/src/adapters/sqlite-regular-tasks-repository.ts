import type { ITaskScheduler } from "@ynab-plus/app";
import type { ConfigValue } from "@ynab-plus/bootstrap";
import { RegularTask, schedulableTasksSchema } from "@ynab-plus/domain";
import type { SqliteDatabase } from "./sqlite-database.ts";

interface RawTask {
  id: string;
  onBehalfOf: string | undefined;
  lastExecution: string | undefined;
  created: string;
  minute: string;
  hour: string;
  day: string;
  month: string;
  weekDay: string;
  name: string;
  description: string;
  command: string;
  data: string | undefined;
}

export class SqliteRegularTaskRepository implements ITaskScheduler {
  public constructor(
    private tableName: ConfigValue<string>,
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
            data = ?
      WHERE id = ?
      RETURNING id, onBehalfOf, lastExecution, created, minute, hour, day, month, weekDay, name, description, command, data`,
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
          data TEXT
      );`,
    );
  }

  private mapRaw(raw: RawTask): RegularTask {
    return new RegularTask({
      ...raw,
      created: new Date(raw.created),

      lastExecution: raw.lastExecution
        ? new Date(raw.lastExecution)
        : undefined,

      command: schedulableTasksSchema.parse(raw.command),
      data: raw.data ?? undefined,
      onBehalfOf: raw.onBehalfOf ?? undefined,
    });
  }

  public async scheduleTask(task: RegularTask): Promise<RegularTask> {
    const data = await this.database.getFromDb<RawTask>(
      `INSERT INTO ${await this.tableName.value} (id, onBehalfOf, lastExecution, created, minute, hour, day, month, weekDay, name, description, command, data)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id, onBehalfOf, lastExecution, created, minute, hour, day, month, weekDay, name, description, command, data`,
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
      `SELECT id, onBehalfOf, lastExecution, created, minute, hour, day, month, weekDay, name, description, command, data
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
      `SELECT id, onBehalfOf, lastExecution, created, minute, hour, day, month, weekDay, name, description, command, data
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
      `SELECT id, onBehalfOf, lastExecution, created, minute, hour, day, month, weekDay, name, description, command, data
        FROM ${await this.tableName.value}
        WHERE onBehalfOf = ?
        LIMIT ? OFFSET ?`,
      [userId, limit, offset],
    );

    return result.map((result) => this.mapRaw(result));
  }
}
