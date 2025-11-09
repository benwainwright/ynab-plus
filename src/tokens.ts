import type { CommandHandler } from "@core";
import { Database } from "bun:sqlite";
import type {
  IEventBus,
  IRepository,
  IServerSocketClient,
  ISessionData,
  ISessionStorage,
  ISimpleStorage,
  IUser,
} from "@types";
import type { BunRequest } from "bun";
import { type ServiceIdentifier } from "inversify";
import type EventEmitter from "node:events";

export const handlerToken: ServiceIdentifier<CommandHandler<keyof Commands>> =
  Symbol.for("handlerToken");

export const eventBusToken: ServiceIdentifier<IEventBus> =
  Symbol.for("eventBusToken");

export const devModeToken: ServiceIdentifier<boolean> = Symbol.for("devMode");
export const flatFileFolderToken: ServiceIdentifier<string> = Symbol.for(
  "flatFileFolderToken",
);

export const indexPageToken: ServiceIdentifier<Bun.HTMLBundle> =
  Symbol.for("indexPageToken");

export const requestToken: ServiceIdentifier<BunRequest> =
  Symbol.for("requestToken");

export const sessionFileStorageToken: ServiceIdentifier<ISimpleStorage> =
  Symbol.for("sessionStorageToken");

export const userIdSessionStore: ServiceIdentifier<
  ISessionStorage<ISessionData>
> = Symbol.for("userIdSessionStore");

export const serverSocketClient: ServiceIdentifier<IServerSocketClient> =
  Symbol.for("serverSocketClient");

export const userRepoToken: ServiceIdentifier<IRepository<IUser>> =
  Symbol.for("userRepoToken");

export const sqlLiteUserRepoTableName: ServiceIdentifier<string> = Symbol.for(
  "sqlLiteUserRepoTableName",
);
export const sqliteDbToken: ServiceIdentifier<Database> =
  Symbol.for("sqlLiteDatabase");

export const rootEventEmitter: ServiceIdentifier<EventEmitter> =
  Symbol.for("rootEventEmitter");

export const eventEmitterNamespace: ServiceIdentifier<string> = Symbol.for(
  "eventEmitterNamespace",
);
