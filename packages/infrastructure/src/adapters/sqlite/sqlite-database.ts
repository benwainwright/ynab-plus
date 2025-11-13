import BetterSqlite3 from "better-sqlite3";
import type { ConfigValue, ILogger } from "@ynab-plus/bootstrap";

export class SqliteDatabase {
  private database: InstanceType<typeof BetterSqlite3> | undefined;

  public constructor(private readonly databaseName: ConfigValue<string>) {}

  private async getDatabase(): Promise<InstanceType<typeof BetterSqlite3>> {
    if (!this.database) {
      this.database = new BetterSqlite3(await this.databaseName.value);
    }

    return this.database;
  }

  public async runQuery(sql: string, ...params: unknown[]) {
    const db = await this.getDatabase();

    const prepared = db.prepare(sql);
    prepared.run(...params);
  }

  public async getFromDb<TResponse>(sql: string, ...params: unknown[]) {
    const db = await this.getDatabase();
    const prepared = db.prepare(sql);
    return prepared.get(...params) as TResponse;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async getAllFromDatabase<TResponse extends any[]>(
    sql: string,
    ...params: unknown[]
  ) {
    const db = await this.getDatabase();
    const prepared = db.prepare(sql);
    return prepared.all(...params) as TResponse;
  }
}
