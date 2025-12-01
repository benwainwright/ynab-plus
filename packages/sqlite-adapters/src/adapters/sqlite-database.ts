import { inject } from "@core";
import type { IUnitOfWork } from "@ynab-plus/app";
import type { ConfigValue } from "@ynab-plus/bootstrap";
import BetterSqlite3 from "better-sqlite3";
import { injectable } from "inversify";

@injectable()
export class SqliteDatabase implements IUnitOfWork {
  private database: InstanceType<typeof BetterSqlite3> | undefined;

  public constructor(
    @inject("DatabaseFilename")
    private readonly databaseName: ConfigValue<string>,
  ) {}

  public async begin(): Promise<void> {
    const db = await this.getDatabase();
    const prepared = db.prepare("BEGIN TRANSACTION;");
    prepared.run();
  }

  public async commit(): Promise<void> {
    const db = await this.getDatabase();
    const prepared = db.prepare("COMMIT;");
    prepared.run();
  }

  public async rollback(): Promise<void> {
    const db = await this.getDatabase();
    const prepared = db.prepare("ROLLBACK;");
    prepared.run();
  }

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
