import type { SqliteDatabase } from "@adapters";
import type { ConfigValue } from "@ynab-plus/bootstrap";

export interface IInternalTypes {
  SqliteDatabase: SqliteDatabase;
  DatabaseFilename: ConfigValue<string>;
  UsersTableName: ConfigValue<string>;
  AccountsTableName: ConfigValue<string>;
  OauthTokenTableName: ConfigValue<string>;
  TasksTableName: ConfigValue<string>;
  TransactionsTableName: ConfigValue<string>;
  SyncDetailsTableName: ConfigValue<string>;
  BankConnectionTableName: ConfigValue<string>;
}
