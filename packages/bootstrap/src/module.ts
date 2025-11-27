import { ContainerModule } from "inversify";
import { getWinstonLogger } from "./winston-logger.ts";
import { BootstrapperToken } from "./i-bootstrapper.ts";
import { BootstrapConfigFileToken, Bootstrapper } from "./bootstrapper.ts";
import { LoggerToken } from "./i-logger.ts";

const LOG_CONTEXT = { context: "bootstrap-module" };

export const bootstrapModule = new ContainerModule((load) => {
  const logger = getWinstonLogger();
  logger.info(`Starting application`, LOG_CONTEXT);
  load
    .bind(BootstrapConfigFileToken)
    .toConstantValue("ynab-plus.config.websocket-server.json");

  logger.info(`Initialising bootstrap module`, LOG_CONTEXT);

  load.bind(LoggerToken).toConstantValue(logger);
  load.bind(BootstrapperToken).to(Bootstrapper);

  logger.debug(`Finished initialising bootstrap module`, LOG_CONTEXT);
});
