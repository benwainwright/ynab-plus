import {
  Sqlite3AccountRepository,
  SqliteDatabase,
  SqliteOauth2TokenRepsoitory,
  SqliteUserRepository,
} from "@adapters";
import type { IBootstrapper, ILogger } from "@ynab-plus/bootstrap";
import z from "zod";

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

  return { oauthTokenRepository, accountsRepository, userRepository };
};
