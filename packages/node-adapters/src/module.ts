import { ContainerModule } from "inversify";
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
import { BootstrapperToken } from "@ynab-plus/bootstrap";
import z from "zod";

export const nodeAdaptersModule = new ContainerModule((load) => {
  load.bind(EventBusListenerToken).toConstantValue(new EventEmitter());
  load.bind(EventBusNamespaceToken).toConstantValue(`ynab-plus`);
  load.bind(SessionStoreObjectStoreToken).to(FlatFileObjectStore);
  load.bind(PasswordHasherToken).to(NodePasswordHashValidator);
  load.bind(PasswordVerifierToken).to(NodePasswordHashValidator);
  load.bind(EventBusToken).to(NodeEventBus);

  load.onActivation(BootstrapperToken, (_context, bootstrapper) => {
    load
      .bind(FlatFileObjectStoreFolderToken)
      .toConstantValue(bootstrapper.configValue("sessionPath", z.string()));

    return bootstrapper;
  });
});
