import type { CommandHandler } from "@core";
import { Database } from "bun:sqlite";
import type {
  IEventBus,
  IObjectStorage,
  IRepository,
  IServerSocketClient,
  ISessionData,
  ISessionStorage,
  IUser,
} from "@types";
import type { BunRequest, S3Client } from "bun";
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

export const objectStorageToken: ServiceIdentifier<IObjectStorage> = Symbol.for(
  "sessionStorageToken",
);

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

export const s3ClientToken: ServiceIdentifier<S3Client> =
  Symbol.for("s3ClientToken");
