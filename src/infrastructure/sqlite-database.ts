import { Database } from "bun:sqlite";
import type { IConfigValue } from "../i-config-value.ts";

export class SqliteDatabase {
  private database: Database | undefined;

  public constructor(private readonly databaseName: IConfigValue<string>) {}

  public async getDatabase(): Promise<Database> {
    if (!this.database) {
      this.database = new Database(await this.databaseName.value, {
        strict: true,
      });
    }

    return this.database;
  }
}
