import EventEmitter from "node:events";

import {
  FlatFileObjectStore,
  NodeEventBus,
  NodePasswordHashValidator,
} from "@adapters";
import type { IBootstrapper, ILogger } from "@ynab-plus/bootstrap";
import type { User } from "@ynab-plus/domain";
import z from "zod";

export const compose = (bootstrapper: IBootstrapper, logger: ILogger) => {
  const events = new EventEmitter();
  const eventBus = new NodeEventBus(events, `ynab-plus`);
  const sessionStorage = new FlatFileObjectStore(
    bootstrapper.configValue("sessionPath", z.string()),
    logger,
  );

  const hashValidator = new NodePasswordHashValidator();

  return { eventBus, sessionStorage, hashValidator };
};
