import {
  devModeToken,
  flatFileFolderToken,
  handlerToken,
  indexPageToken,
  serverSocketClient,
  sessionFileStorageToken,
  userIdSessionStore,
} from "@tokens";
import { Container } from "inversify";

import { indexPage } from "@client";

import {
  GetCurrentUserCommandHandler,
  ListUsersCommandHandler,
  LoginCommandHandler,
  LogoutCommandHandler,
  RegisterCommandHandler,
} from "@handlers";
import { SessionStorage } from "./core/session-storage.ts";
import { join } from "node:path";
import { cwd } from "node:process";
import { FlatFileStorage } from "./core/flat-file-storage.ts";
import { ServerWebsocketClient } from "./core/websocket-client.ts";

export const container = new Container();

container.bind(handlerToken).to(GetCurrentUserCommandHandler);
container.bind(handlerToken).to(ListUsersCommandHandler);
container.bind(handlerToken).to(LoginCommandHandler);
container.bind(handlerToken).to(LogoutCommandHandler);
container.bind(handlerToken).to(RegisterCommandHandler);

container.bind(indexPageToken).toConstantValue(indexPage);
container.bind(Container).toConstantValue(container);
container.bind(userIdSessionStore).to(SessionStorage);

container.bind(devModeToken).toConstantValue(false);
container.bind(flatFileFolderToken).toConstantValue(join(cwd(), ".sessions"));
container.bind(sessionFileStorageToken).to(FlatFileStorage);

container.bind(serverSocketClient).to(ServerWebsocketClient).inRequestScope();
