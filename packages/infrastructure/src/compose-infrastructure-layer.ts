import z from "zod";

import type { IBootstrapper } from "@ynab-plus/bootstrap";
import type { IInfrastructurePorts } from "@ynab-plus/app";

import { SqliteUserRepository } from "./adapters/sqlite/sqlite-user-repository.ts";
import { PasswordHashValidator } from "./adapters/password-hash-validator.ts";
import { FlatFileObjectStore } from "./adapters/flat-file-object-store.ts";
import { SqliteDatabase } from "./adapters/sqlite/sqlite-database.ts";
import { SqliteOauth2TokenRepsoitory } from "./adapters/sqlite/sqlite-oauth2-token-repository.ts";
import { oauthClientFactory } from "./adapters/oauth/oauth-client-factory.ts";
import { NodeUUIDGenerator } from "./adapters/node-uuid-generator.ts";

export const composeInfrastructureLayer = async (
  bootstrapper: IBootstrapper,
): Promise<IInfrastructurePorts> => {
  const database = new SqliteDatabase(
    bootstrapper.configValue(`sqliteFilename`, z.string()),
  );

  const userRepository = new SqliteUserRepository(
    bootstrapper.configValue("userTableName", z.string()),
    database,
  );
  bootstrapper.addInitStep(async () => await userRepository.create());

  const oauthTokenRepository = new SqliteOauth2TokenRepsoitory(
    bootstrapper.configValue("tokenTableName", z.string()),
    database,
  );
  bootstrapper.addInitStep(async () => await oauthTokenRepository.create());

  const passwordHasher = new PasswordHashValidator();

  const sessionStorage = new FlatFileObjectStore(
    bootstrapper.configValue("sessionPath", z.string()),
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
