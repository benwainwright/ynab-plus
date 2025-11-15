import EventEmitter from "node:events";

import {
  FlatFileObjectStore,
  NodeEventBus,
  NodePasswordHashValidator,
  NodeUUIDGenerator,
} from "@adapters";
import type { IBootstrapper, ILogger } from "@ynab-plus/bootstrap";
import type { User } from "@ynab-plus/domain";
import z from "zod";

export const compose = (bootstrapper: IBootstrapper, logger: ILogger) => {
  const uuidGenerator = new NodeUUIDGenerator();
  const events = new EventEmitter();
  const eventBus = new NodeEventBus(events, `ynab-plus`, uuidGenerator);
  const sessionStorage = new FlatFileObjectStore<User>(
    bootstrapper.configValue("sessionPath", z.string()),
    logger,
  );

  const hashValidator = new NodePasswordHashValidator();

  return { uuidGenerator, eventBus, sessionStorage, hashValidator };
};
