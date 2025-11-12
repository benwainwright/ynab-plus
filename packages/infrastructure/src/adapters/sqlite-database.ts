import { Database } from "bun:sqlite";
import type { ConfigValue } from "@ynab-plus/bootstrap";

export class SqliteDatabase {
  private database: Database | undefined;

  public constructor(private readonly databaseName: ConfigValue<string>) {}

  public async getDatabase(): Promise<Database> {
    if (!this.database) {
      this.database = new Database(await this.databaseName.value, {
        strict: true,
      });
    }

    return this.database;
  }
}
