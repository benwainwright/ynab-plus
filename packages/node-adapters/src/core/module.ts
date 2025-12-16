import { EventEmitter } from "node:stream";
import { type IRuntimePorts } from "@ynab-plus/app";
import {
  FlatFileObjectStore,
  NodePasswordHashValidator,
  NodeEventBus,
  NodeStringHasher,
} from "@adapters";

import { typedApplicationModule } from "@ynab-plus/bootstrap";
import z from "zod";
import type { IInternalTypes } from "@core";
import type { TypedContainerModule } from "@inversifyjs/strongly-typed";

const LOG_CONTEXT = { context: "log-context" };

export const nodeAdaptersModule: TypedContainerModule<IRuntimePorts & IInternalTypes> =
  typedApplicationModule<IRuntimePorts & IInternalTypes>(({ load, bootstrapper, logger }) => {
    logger.info(`Initialising node adapters module`, LOG_CONTEXT);
    load.bind("EventBusListener").toConstantValue(new EventEmitter());
    load.bind("BusNamespace").toConstantValue(`ynab-plus`);

    load.bind("StringHasher").to(NodeStringHasher);
    load.bind("ObjectStore").to(FlatFileObjectStore);
    load.bind("PasswordHasher").to(NodePasswordHashValidator);
    load.bind("PasswordVerifier").to(NodePasswordHashValidator);
    load.bind("EventBus").to(NodeEventBus);
    load.bind("StoragePath").toConstantValue(bootstrapper.configValue("storagePath", z.string()));
    logger.debug(`Finished initialising node adapters module`, LOG_CONTEXT);
  });
