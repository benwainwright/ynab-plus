import {
  AccountRepositoryToken,
  OauthTokenRepositoryToken,
  UserRepositoryToken,
  TaskSchedulerToken,
  TransactionRepositoryToken,
  SyncDetailsRepositoryToken,
  BankConnectionRepositoryToken,
} from "@ynab-plus/app";

import {
  Sqlite3AccountRepository,
  SqliteDatabase,
  SqliteOauth2TokenRepsoitory,
  SqliteRegularTaskRepository,
  SqliteUserRepository,
} from "@adapters";

import { TableNameConfigValueToken } from "./adapters/sqlite-user-repository.ts";
import { applicationModule } from "@ynab-plus/bootstrap";
import z from "zod";
import { AccountsRepositoryNameConfigValueToken } from "./adapters/sqlite-account-repository.ts";
import { TaskRepositoryTableNameConfigValueToken } from "./adapters/sqlite-regular-tasks-repository.ts";
import {
  SqliteTransactionRepository,
  TransactionRepoTableNameConfigValueToken,
} from "./adapters/sqlite-transaction-repository.ts";
import {
  SqliteSyncDetailsRepository,
  SqliteSyncDetailsRepositoryTableNameConfigValue,
} from "./adapters/sqlite-sync-details-repository.ts";
import {
  SqliteBankConnectionRepository,
  SqliteBankConnectionRepositoryTableNameConfigValueToken,
} from "./adapters/sqlite-bank-connection-repository.ts";
import { Oauth2RepositoryTableNameConfigValueToken } from "./adapters/sqlite-oauth2-token-repository.ts";
import { SqliteDatabaseNameConfigToken } from "./adapters/sqlite-database.ts";

export const LOG_CONTEXT = { context: "sqlite-data-adapters-module" };

export const sqliteDataAdaptersModule = applicationModule(
  ({ load, bootstrapper, logger }) => {
    logger.debug(`Initialising sqlite adapters module`, LOG_CONTEXT);

    load
      .bind(SqliteDatabaseNameConfigToken)
      .toConstantValue(bootstrapper.configValue("sqliteFilename", z.string()));

    load.bind(SqliteDatabase).toSelf();

    load
      .bind(TableNameConfigValueToken)
      .toConstantValue(bootstrapper.configValue("userTableName", z.string()));

    load
      .bind(AccountsRepositoryNameConfigValueToken)
      .toConstantValue(
        bootstrapper.configValue("accountsTableName", z.string()),
      );

    load
      .bind(Oauth2RepositoryTableNameConfigValueToken)
      .toConstantValue(bootstrapper.configValue("tokenTableName", z.string()));

    load
      .bind(TaskRepositoryTableNameConfigValueToken)
      .toConstantValue(bootstrapper.configValue("tasksTableName", z.string()));

    load
      .bind(TransactionRepoTableNameConfigValueToken)
      .toConstantValue(
        bootstrapper.configValue("transactionsTableName", z.string()),
      );

    load
      .bind(SqliteSyncDetailsRepositoryTableNameConfigValue)
      .toConstantValue(
        bootstrapper.configValue("syncdetailsTablename", z.string()),
      );

    load
      .bind(SqliteBankConnectionRepositoryTableNameConfigValueToken)
      .toConstantValue(
        bootstrapper.configValue("bankconnectionTablename", z.string()),
      );

    load
      .bind(UserRepositoryToken)
      .to(SqliteUserRepository)
      .onActivation(async (_context, repo) => {
        await repo.create();
        return repo;
      });

    load
      .bind(AccountRepositoryToken)
      .to(Sqlite3AccountRepository)
      .onActivation(async (_context, repo) => {
        await repo.create();
        return repo;
      });

    load
      .bind(OauthTokenRepositoryToken)
      .to(SqliteOauth2TokenRepsoitory)
      .onActivation(async (_context, repo) => {
        await repo.create();
        return repo;
      });

    load
      .bind(TaskSchedulerToken)
      .to(SqliteRegularTaskRepository)
      .onActivation(async (_context, repo) => {
        await repo.create();
        return repo;
      });

    load
      .bind(TransactionRepositoryToken)
      .to(SqliteTransactionRepository)
      .onActivation(async (_context, repo) => {
        await repo.create();
        return repo;
      });

    load
      .bind(SyncDetailsRepositoryToken)
      .to(SqliteSyncDetailsRepository)
      .onActivation(async (_context, repo) => {
        await repo.create();
        return repo;
      });

    load
      .bind(BankConnectionRepositoryToken)
      .to(SqliteBankConnectionRepository)
      .onActivation(async (_context, repo) => {
        await repo.create();
        return repo;
      });

    logger.debug(`Finished initialising sqlite adapters module`, LOG_CONTEXT);
  },
);
