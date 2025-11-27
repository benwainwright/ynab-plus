import type { ServiceIdentifier } from "inversify";
import type { IObjectStorage } from "./i-object-storage.ts";

export const SessionStoreObjectStoreToken: ServiceIdentifier<IObjectStorage> =
  Symbol.for("SessionStoreObjectStore");
