import type { IConfigurator } from "./i-configurator.ts";

export interface IConfigurable {
  configure(configurator: IConfigurator): Promise<void>;
}
