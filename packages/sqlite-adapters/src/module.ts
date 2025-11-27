import { ContainerModule } from "inversify";
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
import { BootstrapperToken } from "@ynab-plus/bootstrap";
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

export const sqliteDataAdaptersModule = new ContainerModule((load) => {
  load.bind(SqliteDatabase).toSelf();

  load.onActivation(BootstrapperToken, (_context, bootstrapper) => {
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
      .toConstantValue(
        bootstrapper.configValue("oauthTokenTableName", z.string()),
      );

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
        bootstrapper.configValue("syncDetailsTableName", z.string()),
      );

    load
      .bind(SqliteBankConnectionRepositoryTableNameConfigValueToken)
      .toConstantValue(
        bootstrapper.configValue("bankConnectionTableName", z.string()),
      );

    return bootstrapper;
  });

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
});
