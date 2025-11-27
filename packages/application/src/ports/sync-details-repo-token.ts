import type { ServiceIdentifier } from "inversify";
import type { IRepository } from "./i-repository.ts";
import type { User } from "@ynab-plus/domain";

export const SyncDetailsRepositoryToken: ServiceIdentifier<IRepository<User>> =
  Symbol.for("UserRopo");
