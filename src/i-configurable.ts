import type { IBootstrapper } from "./i-bootstrapper.ts";

export interface IConfigurable {
  configure(configurator: IBootstrapper): Promise<void>;
}
