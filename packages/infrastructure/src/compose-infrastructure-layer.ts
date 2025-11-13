import z from "zod";

import type { IBootstrapper, ILogger } from "@ynab-plus/bootstrap";
import type { IInfrastructurePorts } from "@ynab-plus/app";

import { SqliteUserRepository } from "./adapters/sqlite/sqlite-user-repository.ts";
import { FlatFileObjectStore } from "./adapters/flat-file-object-store.ts";
import { SqliteDatabase } from "./adapters/sqlite/sqlite-database.ts";
import { SqliteOauth2TokenRepsoitory } from "./adapters/sqlite/sqlite-oauth2-token-repository.ts";
import { oauthClientFactory } from "./adapters/oauth/oauth-client-factory.ts";
import { NodeUUIDGenerator } from "./adapters/node-uuid-generator.ts";
import { NodePasswordHashValidator } from "./adapters/node-password-hash-validator.ts";

export const LOG_CONTEXT = { context: "compose-infra-layer" };

export const composeInfrastructureLayer = async (
  bootstrapper: IBootstrapper,
  logger: ILogger,
): Promise<IInfrastructurePorts> => {
  logger.info(`Composing infrastructure layer`, LOG_CONTEXT);
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

  const oauthTokenRepository = new SqliteOauth2TokenRepsoitory(
    bootstrapper.configValue("tokenTableName", z.string()),
    database,
  );
  bootstrapper.addInitStep(async () => {
    logger.debug(`Creating oauth repository if it doesn't exist`, LOG_CONTEXT);
    await oauthTokenRepository.create();
  });

  const passwordHasher = new NodePasswordHashValidator();

  const sessionStorage = new FlatFileObjectStore(
    bootstrapper.configValue("sessionPath", z.string()),
    logger,
  );

  const uuidGenerator = new NodeUUIDGenerator();

  const oauthClients = oauthClientFactory(bootstrapper);

  return {
    misc: {
      uuidGenerator,
    },
    auth: {
      passwordVerifier: passwordHasher,
      passwordHasher,
    },
    data: {
      userRepository,
      sessionStorage,
    },
    oauth: {
      oauthCheckerFactory: oauthClients,
      oauthTokenRepository,
      newTokenRequesterFactory: oauthClients,
    },
  };
};
