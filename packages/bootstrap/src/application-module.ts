import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { LoggerToken, type ILogger } from "./i-logger.ts";
import { BootstrapperToken, type IBootstrapper } from "./i-bootstrapper.ts";

export const applicationModule = (
  callback: ({
    load,
    bootstrapper,
    logger,
  }: {
    load: ContainerModuleLoadOptions;
    bootstrapper: IBootstrapper;
    logger: ILogger;
  }) => void,
) => {
  return new ContainerModule((load) => {
    load.onActivation(BootstrapperToken, (context, bootstrapper) => {
      const logger = context.get(LoggerToken);
      callback({ load, bootstrapper, logger });
      return bootstrapper;
    });
  });
};
