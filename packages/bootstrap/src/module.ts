import { ContainerModule } from "inversify";
import { getWinstonLogger } from "./winston-logger.ts";
import { BootstrapperToken } from "./i-bootstrapper.ts";
import { BootstrapConfigFileToken, Bootstrapper } from "./bootstrapper.ts";
import { LoggerToken } from "./i-logger.ts";

export const bootstrapModule = new ContainerModule((load) => {
  load
    .bind(BootstrapConfigFileToken)
    .toConstantValue("ynab-plus.config.websocket-server.json");

  const logger = getWinstonLogger();

  load.bind(LoggerToken).toConstantValue(logger);
  load.bind(BootstrapperToken).to(Bootstrapper);
});
