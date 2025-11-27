import type { Container } from "inversify";
import type { IBootstrapper } from "./i-bootstrapper.ts";
import type { ILogger } from "./i-logger.ts";

export interface BootstrapTypes {
  Container: Container;
  Bootstrapper: IBootstrapper;
  Logger: ILogger;
}
