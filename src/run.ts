import { EventEmitter } from "node:events";
import { Database } from "bun:sqlite";
import { createServer } from "@core";
import { logger } from "./logger.ts";
import { EventBus } from "./core/event-bus.ts";
import { HelloWorldHandler } from "./handlers/index.ts";
import { RegisterCommandHandler } from "./handlers/register-user-command.ts";
import { UserRepository } from "./data/user-repository.ts";
import { GetCurrentUserCommandHandler } from "./handlers/get-current-user-command-handler.ts";

const events = new EventEmitter();
const bus = new EventBus(events, `ynab-app`);

const database = new Database("ynab-plus.sqlite", { strict: true });

const userRepository = new UserRepository(`users`, database);

userRepository.create();

const handlers = [
  new HelloWorldHandler(),
  new RegisterCommandHandler(userRepository),
  new GetCurrentUserCommandHandler(userRepository),
];

const server = createServer(handlers, bus);

logger.log("info", `Server running at ${server.url}`);
