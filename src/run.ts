import { EventEmitter } from "node:events";
import { Database } from "bun:sqlite";

import { createServer, EventBus } from "@core";
import { indexPage } from "@client";

import { logger } from "./logger.ts";

import {
  RegisterCommandHandler,
  GetCurrentUserCommandHandler,
  LogoutCommandHandler,
} from "@handlers";

import { SqliteUserRepository } from "@data";
import { LoginCommandHandler } from "./handlers/login-command.ts";

const events = new EventEmitter();
const bus = new EventBus(events, `ynab-app`);

const database = new Database("ynab-plus.sqlite", { strict: true });

const userRepository = new SqliteUserRepository(`users`, database);

userRepository.create();

const handlers = [
  new RegisterCommandHandler(userRepository),
  new LoginCommandHandler(userRepository),
  new LogoutCommandHandler(),
  new GetCurrentUserCommandHandler(userRepository),
];

const server = createServer({
  handlers,
  eventBus: bus,
  indexPage,
  developmentMode: false,
});

logger.log("info", `Server running at ${server.url}`);
