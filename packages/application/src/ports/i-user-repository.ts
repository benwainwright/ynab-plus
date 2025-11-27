import type { ServiceIdentifier } from "inversify";
import type { IRepository } from "./i-repository.ts";
import type { IMultipleRepository } from "./i-multiple-repository.ts";
import type { User } from "@ynab-plus/domain";

export const UserRepositoryToken: ServiceIdentifier<
  IRepository<User> & IMultipleRepository<User>
> = Symbol.for("UserRepository");
