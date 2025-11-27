import {
  TypedContainerModule,
  type TypedContainerModuleLoadOptions,
  TypedContainer,
} from "@inversifyjs/strongly-typed";
import { type ILogger } from "./i-logger.ts";
import { type IBootstrapper } from "./i-bootstrapper.ts";
import type { BootstrapTypes } from "./bootstrap-types.ts";

export const typedApplicationModule = <TTypeMap>(
  callback: ({
    load,
    bootstrapper,
    container,
    logger,
  }: {
    load: TypedContainerModuleLoadOptions<TTypeMap & BootstrapTypes>;
    bootstrapper: IBootstrapper;
    logger: ILogger;
    container: TypedContainer<TTypeMap & BootstrapTypes>;
  }) => void,
) => {
  return new TypedContainerModule<TTypeMap & BootstrapTypes>((load) => {
    load.onActivation("Bootstrapper", (context, bootstrapper) => {
      const container =
        context.get<TypedContainer<TTypeMap & BootstrapTypes>>("Container");
      const logger = container.get("Logger");
      callback({ load, bootstrapper, logger, container });
      return bootstrapper;
    });
  });
};
