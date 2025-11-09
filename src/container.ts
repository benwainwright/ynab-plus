import { join } from "node:path";
import { cwd } from "node:process";
import EventEmitter from "node:events";

import { Database } from "bun:sqlite";

import { Container } from "inversify";

import {
  devModeToken,
  eventBusToken,
  eventEmitterNamespace,
  flatFileFolderToken,
  handlerToken,
  indexPageToken,
  rootEventEmitter,
  serverSocketClient,
  objectStorageToken,
  sqliteDbToken,
  sqlLiteUserRepoTableName,
  userIdSessionStore,
  userRepoToken,
} from "@tokens";

import { indexPage } from "@client";

import {
  GetCurrentUserCommandHandler,
  GetUserCommandHandler,
  ListUsersCommandHandler,
  LoginCommandHandler,
  LogoutCommandHandler,
  RegisterCommandHandler,
} from "@handlers";

import {
  AppServer,
  EventBus,
  ServerWebsocketClient,
  SessionStorage,
} from "@core";

import { FlatFileObjectStore, SqliteUserRepository } from "@data";

export const container = new Container();

container.bind(sqlLiteUserRepoTableName).toConstantValue("users");
container.bind(devModeToken).toConstantValue(false);
container.bind(flatFileFolderToken).toConstantValue(join(cwd(), ".sessions"));

container.bind(eventBusToken).to(EventBus).inSingletonScope();

container.bind(handlerToken).to(GetCurrentUserCommandHandler);
container.bind(handlerToken).to(ListUsersCommandHandler);
container.bind(handlerToken).to(LoginCommandHandler);
container.bind(handlerToken).to(LogoutCommandHandler);
container.bind(handlerToken).to(RegisterCommandHandler);
container.bind(handlerToken).to(GetUserCommandHandler);

container.bind(indexPageToken).toConstantValue(indexPage);
container.bind(Container).toConstantValue(container);
container.bind(userIdSessionStore).to(SessionStorage);

container.bind(objectStorageToken).to(FlatFileObjectStore);
container.bind(serverSocketClient).to(ServerWebsocketClient).inRequestScope();

const database = new Database("ynab-plus.sqlite", { strict: true });

container.bind(sqliteDbToken).toConstantValue(database);

const userRepo = new SqliteUserRepository("users", database);

userRepo.create();

container.bind(userRepoToken).toConstantValue(userRepo);

const events = new EventEmitter();

container.bind(rootEventEmitter).toConstantValue(events);
container.bind(eventEmitterNamespace).toConstantValue("ynab-app");

container.bind(AppServer).to(AppServer);
