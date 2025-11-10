import { join } from "node:path";
import { cwd } from "node:process";

import { Database } from "bun:sqlite";

import type { IInfrastructurePorts } from "@application";
import { SqliteUserRepository } from "./sqlite-user-repository.ts";
import { PasswordHashValidator } from "./password-hash-validator.ts";
import { FlatFileObjectStore } from "./flat-file-object-store.ts";

export const composeInfrastructureLayer = (): IInfrastructurePorts => {
  const database = new Database("ynab-plus.sqlite", { strict: true });
  const userRepository = new SqliteUserRepository("users", database);
  const passwordHasher = new PasswordHashValidator();
  const sessionStorage = new FlatFileObjectStore(join(cwd(), ".sessions"));

  return {
    userRepository,
    passwordHasher,
    passwordVerifier: passwordHasher,
    sessionStorage,
  };
};
