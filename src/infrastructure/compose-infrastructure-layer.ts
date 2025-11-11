import type { IInfrastructurePorts } from "@application";

import { SqliteUserRepository } from "./sqlite-user-repository.ts";
import { PasswordHashValidator } from "./password-hash-validator.ts";
import { FlatFileObjectStore } from "./flat-file-object-store.ts";
import { BunUUIDGenerator } from "./bun-uuid-generator.ts";
import type { IBootstrapper } from "../i-bootstrapper.ts";
import z from "zod";
import { SqliteDatabase } from "./sqlite-database.ts";

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

  const passwordHasher = new PasswordHashValidator();

  const sessionStorage = new FlatFileObjectStore(
    bootstrapper.configValue("sessionPath", z.string()),
  );

  const uuidGenerator = new BunUUIDGenerator();

  return {
    userRepository,
    passwordHasher,
    passwordVerifier: passwordHasher,
    sessionStorage,
    uuidGenerator,
  };
};
