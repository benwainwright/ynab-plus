import type { CommandHandler } from "@core";
import type {
  IEventBus,
  IServerSocketClient,
  ISessionData,
  ISessionStorage,
  ISimpleStorage,
} from "@types";
import type { BunRequest } from "bun";
import { type ServiceIdentifier } from "inversify";

export const handlerToken: ServiceIdentifier<CommandHandler<keyof Commands>> =
  Symbol.for("handlerService");

export const eventBusToken: ServiceIdentifier<IEventBus> =
  Symbol.for("handlerService");

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
