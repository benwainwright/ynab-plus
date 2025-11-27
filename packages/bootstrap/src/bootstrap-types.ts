import type { IBootstrapper } from "./i-bootstrapper.ts";
import type { ILogger } from "./i-logger.ts";
import type { TypedContainer } from "@inversifyjs/strongly-typed";

export interface BootstrapTypes {
  Container: TypedContainer;
  Bootstrapper: IBootstrapper;
  Logger: ILogger;
}
