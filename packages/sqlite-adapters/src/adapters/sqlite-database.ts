import { inject } from "@core";
import type { IUnitOfWork } from "@ynab-plus/app";
import type { ConfigValue } from "@ynab-plus/bootstrap";

import BetterSqlite3 from "better-sqlite3";
import { injectable } from "inversify";

type StoredQuery = {
  sql: string;
  params: unknown[];
};

@injectable()
export class SqliteDatabase implements IUnitOfWork {
  private database: InstanceType<typeof BetterSqlite3> | undefined;
  private readonly storedQueries: StoredQuery[] = [];

  public constructor(
    @inject("DatabaseFilename")
    private readonly databaseName: ConfigValue<string>,
  ) {}

  public async begin(): Promise<void> {
    // NOOP - all handled by the bettersqlite3 transaction function
  }

  public async commit(): Promise<void> {
    const db = await this.getDatabase();
    try {
      this.runQuerySync(db, "BEGIN TRANSACTION;");
      let query: StoredQuery | undefined;

      do {
        query = this.storedQueries.pop();
        if (query) {
          this.runQuerySync(db, query.sql, ...query.params);
        }
      } while (typeof query !== "undefined");
      this.runQuerySync(db, "COMMIT TRANSACTION;");
    } catch (error) {
      this.runQuerySync(db, "ROLLBACK TRANSACTION;");
      throw error;
    }
  }

  public async rollback(): Promise<void> {}

  private async getDatabase(): Promise<InstanceType<typeof BetterSqlite3>> {
    if (!this.database) {
      this.database = new BetterSqlite3(await this.databaseName.value);
    }

    return this.database;
  }

  // oxlint-disable eslint/require-await
  public async deferQueryToTransaction(sql: string, ...params: unknown[]) {
    this.storedQueries.push({
      sql,
      params,
    });
  }

  private runQuerySync(
    database: InstanceType<typeof BetterSqlite3>,
    sql: string,
    ...params: unknown[]
  ) {
    const prepared = database.prepare(sql);
    prepared.run(...params);
  }

  public async runQuery(sql: string, ...params: unknown[]) {
    const db = await this.getDatabase();

    this.runQuerySync(db, sql, ...params);
  }

  public async getFromDb<TResponse>(sql: string, ...params: unknown[]) {
    const db = await this.getDatabase();
    const prepared = db.prepare(sql);
    return prepared.get(...params) as TResponse;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async getAllFromDatabase<TResponse extends any[]>(sql: string, ...params: unknown[]) {
    const db = await this.getDatabase();
    const prepared = db.prepare(sql);
    return prepared.all(...params) as TResponse;
  }
}
