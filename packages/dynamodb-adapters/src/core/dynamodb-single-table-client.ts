import { injectable, optional } from "inversify";
import { inject } from "./typed-inject.ts";
import { OneTableError, Table } from "dynamodb-onetable";
import type { ConfigValue } from "@ynab-plus/bootstrap";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Schema } from "./schema.ts";
import type { IUnitOfWork } from "@ynab-plus/app";

@injectable()
export class DyanamoDbSingleTableClient implements IUnitOfWork {
  private _table: Table<typeof Schema> | undefined;

  public constructor(
    @inject("AWSAccessKeyId")
    private awsAccessKeyId: ConfigValue<string>,

    @inject("AWSSecretKey")
    private awsSecretKey: ConfigValue<string>,

    @inject("AWSAccountID")
    private awsAccountId: ConfigValue<string>,

    @inject("AWSRegion")
    private awsRegion: ConfigValue<string>,

    @inject("AWSEndpoint")
    @optional()
    private awsEndpoint: string | undefined,
  ) {}

  public transaction: { timestamp?: Date; TransactItems?: unknown[] } = {};

  public async begin(): Promise<void> {}

  public async commit(): Promise<void> {
    try {
      const table = await this.getTable();

      if ((this.transaction.TransactItems?.length ?? 0) > 0) {
        await table.transact("write", this.transaction);
      }
    } catch (error) {
      if (error instanceof OneTableError) {
        throw error;
      }
    } finally {
      this.transaction = {};
    }
  }
  public async rollback(): Promise<void> {}

  public async create() {
    const table = await this.getTable();

    const exists = await table.exists();

    if (exists && process.env["NODE_ENV"] !== "production") {
      await table.deleteTable("DeleteTableForever");
    }
    await table.createTable();
  }

  public async getTable() {
    if (!this._table) {
      const client = new DynamoDBClient({
        credentials: {
          accessKeyId: await this.awsAccessKeyId.value,
          secretAccessKey: await this.awsSecretKey.value,
          accountId: await this.awsAccountId.value,
        },
        ...(this.awsEndpoint ? { endpoint: this.awsEndpoint } : {}),
        region: await this.awsRegion.value,
      });

      this._table = new Table({
        partial: true,
        client: client,
        name: "ynab-plus-data",
        schema: Schema,
      });
    }

    return this._table;
  }
}
