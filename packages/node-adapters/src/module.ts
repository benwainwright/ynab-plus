import {
  EventBusListenerToken,
  EventBusNamespaceToken,
  NodeEventBus,
} from "./adapters/node-event-bus.ts";
import { EventEmitter } from "node:stream";
import {
  EventBusToken,
  PasswordHasherToken,
  PasswordVerifierToken,
  SessionStoreObjectStoreToken,
} from "@ynab-plus/app";
import { FlatFileObjectStore, NodePasswordHashValidator } from "@adapters";
import { FlatFileObjectStoreFolderToken } from "./adapters/flat-file-object-store.ts";
import { applicationModule } from "@ynab-plus/bootstrap";
import z from "zod";

const LOG_CONTEXT = { context: "log-context" };

export const nodeAdaptersModule = applicationModule(
  ({ load, bootstrapper, logger }) => {
    logger.info(`Initialising node adapters module`, LOG_CONTEXT);
    load.bind(EventBusListenerToken).toConstantValue(new EventEmitter());
    load.bind(EventBusNamespaceToken).toConstantValue(`ynab-plus`);
    load.bind(SessionStoreObjectStoreToken).to(FlatFileObjectStore);
    load.bind(PasswordHasherToken).to(NodePasswordHashValidator);
    load.bind(PasswordVerifierToken).to(NodePasswordHashValidator);
    load.bind(EventBusToken).to(NodeEventBus);
    load
      .bind(FlatFileObjectStoreFolderToken)
      .toConstantValue(bootstrapper.configValue("sessionPath", z.string()));
    logger.debug(`Finished initialising node adapters module`, LOG_CONTEXT);
  },
);
