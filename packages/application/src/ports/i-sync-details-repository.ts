import type { ServiceIdentifier } from "inversify";
import type { IRepository } from "./i-repository.ts";
import type { SyncDetails } from "@ynab-plus/domain";

export const SyncDetailsRepositoryToken: ServiceIdentifier<
  IRepository<SyncDetails>
> = Symbol.for("SyncDetailsRepository");
