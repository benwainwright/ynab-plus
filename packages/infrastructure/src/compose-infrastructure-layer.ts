import EventEmitter from "node:events";

import type { IInfrastructurePorts } from "@ynab-plus/app";
import type { IBootstrapper, ILogger } from "@ynab-plus/bootstrap";
import { type IUser,User } from "@ynab-plus/domain";
import z from "zod";

import { FlatFileObjectStore } from "./adapters/flat-file-object-store.ts";
import { NodeEventBus } from "./adapters/node-event-bus.ts";
import { NodePasswordHashValidator } from "./adapters/node-password-hash-validator.ts";
import { NodeUUIDGenerator } from "./adapters/node-uuid-generator.ts";
import { oauthClientFactory } from "./adapters/oauth/oauth-client-factory.ts";
import { SqliteDatabase } from "./adapters/sqlite/sqlite-database.ts";
import { SqliteOauth2TokenRepsoitory } from "./adapters/sqlite/sqlite-oauth2-token-repository.ts";
import { SqliteUserRepository } from "./adapters/sqlite/sqlite-user-repository.ts";

export const LOG_CONTEXT = { context: "compose-infra-layer" };

export const composeInfrastructureLayer = async (
  bootstrapper: IBootstrapper,
  logger: ILogger,
  // eslint-disable-next-line @typescript-eslint/require-await
): Promise<IInfrastructurePorts> => {
  logger.info(`Composing infrastructure layer`, LOG_CONTEXT);
  const database = new SqliteDatabase(
    bootstrapper.configValue(`sqliteFilename`, z.string()),
  );

  const passwordHasher = new NodePasswordHashValidator();

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

  const sessionStorage = new FlatFileObjectStore<IUser>(
    bootstrapper.configValue("sessionPath", z.string()),
    logger,
  );

  const uuidGenerator = new NodeUUIDGenerator();
  const events = new EventEmitter();
  const eventBus = new NodeEventBus(events, `ynab-plus`, uuidGenerator);

  const oauthClients = oauthClientFactory(
    bootstrapper.configValue(`ynabClientId`, z.string()),
    bootstrapper.configValue(`ynabClientSecret`, z.string()),
    bootstrapper.configValue(`ynabRedirectUri`, z.string()),
  );

  return {
    messaging: {
      eventBus,
    },
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
