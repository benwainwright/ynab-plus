import { Database } from "bun:sqlite";

import type { IInfrastructurePorts } from "@application";

import { SqliteUserRepository } from "./sqlite-user-repository.ts";
import { PasswordHashValidator } from "./password-hash-validator.ts";
import { FlatFileObjectStore } from "./flat-file-object-store.ts";
import { BunUUIDGenerator } from "./bun-uuid-generator.ts";
import type { IConfigurator } from "../i-configurator.ts";
import z from "zod";

export const composeInfrastructureLayer = async (
  configurator: IConfigurator,
): Promise<IInfrastructurePorts> => {
  const filename = await configurator.getConfig(`sqliteFilename`, z.string());

  const database = new Database(filename, { strict: true });

  const userRepository = new SqliteUserRepository("users", database);
  const passwordHasher = new PasswordHashValidator();
  const sessionStorage = new FlatFileObjectStore();

  await sessionStorage.configure(configurator);

  const uuidGenerator = new BunUUIDGenerator();

  return {
    userRepository,
    passwordHasher,
    passwordVerifier: passwordHasher,
    sessionStorage,
    uuidGenerator,
  };
};
