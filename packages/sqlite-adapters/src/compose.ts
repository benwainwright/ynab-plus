import {
  Sqlite3AccountRepository,
  SqliteDatabase,
  SqliteRegularTaskRepository,
  SqliteOauth2TokenRepsoitory,
  SqliteUserRepository,
} from "@adapters";
import type { IBootstrapper, ILogger } from "@ynab-plus/bootstrap";
import z from "zod";
import { SqliteTransactionRepository } from "./adapters/sqlite-transaction-repository.ts";
import { SqliteSyncDetailsRepository } from "./adapters/sqlite-sync-details-repository.ts";
import { SqliteBankConnectionRepository } from "./adapters/sqlite-bank-connection-repository.ts";

export const LOG_CONTEXT = { context: "compose-sqlite-adapters" };

export const compose = (bootstrapper: IBootstrapper, logger: ILogger) => {
  const database = new SqliteDatabase(
    bootstrapper.configValue(`sqliteFilename`, z.string()),
  );

  const userRepository = new SqliteUserRepository(
    bootstrapper.configValue("userTableName", z.string()),
    database,
  );

  bootstrapper.addInitStep(async () => {
    logger.debug(`Creating user repository if it doesn't exist`, LOG_CONTEXT);
    await userRepository.create();
  });

  const accountsRepository = new Sqlite3AccountRepository(
    bootstrapper.configValue("accountsTableName", z.string()),
    database,
  );

  bootstrapper.addInitStep(async () => {
    logger.debug(
      `Creating accounts repository if it doesn't exist`,
      LOG_CONTEXT,
    );
    await accountsRepository.create();
  });

  const oauthTokenRepository = new SqliteOauth2TokenRepsoitory(
    bootstrapper.configValue("tokenTableName", z.string()),
    database,
  );

  bootstrapper.addInitStep(async () => {
    logger.debug(`Creating tokens repository if it doesn't exist`, LOG_CONTEXT);
    await oauthTokenRepository.create();
  });

  const taskRepo = new SqliteRegularTaskRepository(
    bootstrapper.configValue(`tasksTableName`, z.string()),
    database,
  );

  bootstrapper.addInitStep(async () => {
    logger.debug(`Creating tasks repository if it doesn't exist`, LOG_CONTEXT);
    await taskRepo.create();
  });

  const transactionRepository = new SqliteTransactionRepository(
    bootstrapper.configValue(`transactionsTableName`, z.string()),
    database,
  );

  bootstrapper.addInitStep(async () => {
    logger.debug(
      `Creating transactions repository if it doesn't exist`,
      LOG_CONTEXT,
    );
    await transactionRepository.create();
  });

  const syncdetailsRepository = new SqliteSyncDetailsRepository(
    bootstrapper.configValue(`syncdetailsTablename`, z.string()),
    database,
  );

  bootstrapper.addInitStep(async () => {
    logger.debug(
      `Creating syncDetails repository if it doesn't exist`,
      LOG_CONTEXT,
    );
    await syncdetailsRepository.create();
  });

  const bankConnectionRepository = new SqliteBankConnectionRepository(
    bootstrapper.configValue(`bankconnectionTablename`, z.string()),
    database,
  );

  bootstrapper.addInitStep(async () => {
    logger.debug(
      `Creating bank connection repository if it doesn't exist`,
      LOG_CONTEXT,
    );
    await bankConnectionRepository.create();
  });

  return {
    oauthTokenRepository,
    accountsRepository,
    transactionRepository,
    userRepository,
    syncdetailsRepository,
    tasksRepository: taskRepo,
    bankConnectionRepository,
  };
};
