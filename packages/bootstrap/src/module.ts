import { getWinstonLogger } from "./winston-logger.ts";
import { Bootstrapper } from "./bootstrapper.ts";
import { TypedContainerModule } from "@inversifyjs/strongly-typed";
import type { BootstrapTypes } from "./bootstrap-types.ts";
import type { IInternalTypes } from "./i-internal-types.ts";

const LOG_CONTEXT = { context: "bootstrap-module" };

export const bootstrapModule = new TypedContainerModule<BootstrapTypes & IInternalTypes>((load) => {
  const logger = getWinstonLogger();
  logger.info(`Starting application`, LOG_CONTEXT);

  load.bind("ConfigFile").toConstantValue("ynab-plus.config.websocket-server.json");

  logger.info(`Initialising bootstrap module`, LOG_CONTEXT);

  load.bind("Logger").toConstantValue(logger);
  load.bind("Bootstrapper").to(Bootstrapper);

  logger.debug(`Finished initialising bootstrap module`, LOG_CONTEXT);
});
