import type { ServiceIdentifier } from "inversify";
import type { ISingleItemStore } from "./i-single-item-store.ts";
import type { User } from "@ynab-plus/domain";

export const SessionStoreToken: ServiceIdentifier<ISingleItemStore<User>> =
  Symbol.for("SessionStore");
