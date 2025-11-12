import z from "zod";

import type { IBootstrapper } from "@bootstrap";
import type { IInfrastructurePorts } from "@application";

import { SqliteUserRepository } from "./adapters/sqlite-user-repository.ts";
import { PasswordHashValidator } from "./adapters/password-hash-validator.ts";
import { FlatFileObjectStore } from "./adapters/flat-file-object-store.ts";
import { BunUUIDGenerator } from "./adapters/bun-uuid-generator.ts";
import { SqliteDatabase } from "./adapters/sqlite-database.ts";
import { SqliteOauth2TokenRepsoitory } from "./adapters/sqlite-oauth2-token-repository.ts";
import { oauthClientFactory } from "./adapters/oauth/oauth-client-factory.ts";

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

  const uuidGenerator = new BunUUIDGenerator();

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
