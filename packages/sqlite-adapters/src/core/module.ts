import z from "zod";

import { typedApplicationModule } from "@ynab-plus/bootstrap";
import { type IDataPorts } from "@ynab-plus/app";

import {
  Sqlite3AccountRepository,
  SqliteBankConnectionRepository,
  SqliteDatabase,
  SqliteOauth2TokenRepsoitory,
  SqliteRegularTaskRepository,
  SqliteSyncDetailsRepository,
  SqliteTransactionRepository,
  SqliteUserRepository
} from "@adapters";

import type { IInternalTypes } from "./internal-types.ts";
import type { TypedContainerModule } from "@inversifyjs/strongly-typed";

export const LOG_CONTEXT = { context: "sqlite-data-adapters-module" };

export const sqliteDataAdaptersModule: TypedContainerModule<IDataPorts & IInternalTypes> =
  typedApplicationModule<IDataPorts & IInternalTypes>(({ load, bootstrapper, logger }) => {
    logger.debug(`Initialising sqlite adapters module`, LOG_CONTEXT);

    load
      .bind("DatabaseFilename")
      .toConstantValue(bootstrapper.configValue("sqliteFilename", z.string()));

    load.bind("SqliteDatabase").to(SqliteDatabase).inSingletonScope();
    load.bind("UnitOfWork").toService("SqliteDatabase");

    load
      .bind("UsersTableName")
      .toConstantValue(bootstrapper.configValue("userTableName", z.string()));

    load
      .bind("AccountsTableName")
      .toConstantValue(bootstrapper.configValue("accountsTableName", z.string()));

    load
      .bind("OauthTokenTableName")
      .toConstantValue(bootstrapper.configValue("tokenTableName", z.string()));

    load
      .bind("TasksTableName")
      .toConstantValue(bootstrapper.configValue("tasksTableName", z.string()));

    load
      .bind("TransactionsTableName")
      .toConstantValue(bootstrapper.configValue("transactionsTableName", z.string()));

    load
      .bind("SyncDetailsTableName")
      .toConstantValue(bootstrapper.configValue("syncdetailsTablename", z.string()));

    load
      .bind("BankConnectionTableName")
      .toConstantValue(bootstrapper.configValue("bankconnectionTablename", z.string()));

    load
      .bind("UserRepository")
      .to(SqliteUserRepository)
      .onActivation(async (_context, repo) => {
        await repo.create();
        return repo;
      });

    load
      .bind("AccountRepository")
      .to(Sqlite3AccountRepository)
      .onActivation(async (_context, repo) => {
        await repo.create();
        return repo;
      });

    load
      .bind("OauthTokenRepository")
      .to(SqliteOauth2TokenRepsoitory)
      .onActivation(async (_context, repo) => {
        await repo.create();
        return repo;
      });

    load
      .bind("TaskScheduler")
      .to(SqliteRegularTaskRepository)
      .onActivation(async (_context, repo) => {
        await repo.create();
        return repo;
      });

    load
      .bind("TransactionRepository")
      .to(SqliteTransactionRepository)
      .onActivation(async (_context, repo) => {
        await repo.create();
        return repo;
      });

    load
      .bind("SyncDetailsRepository")
      .to(SqliteSyncDetailsRepository)
      .onActivation(async (_context, repo) => {
        await repo.create();
        return repo;
      });

    load
      .bind("BankConnectionRepository")
      .to(SqliteBankConnectionRepository)
      .onActivation(async (_context, repo) => {
        await repo.create();
        return repo;
      });

    logger.debug(`Finished initialising sqlite adapters module`, LOG_CONTEXT);
  });
