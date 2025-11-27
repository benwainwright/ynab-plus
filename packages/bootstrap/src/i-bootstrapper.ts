import type { StandardSchemaV1 } from "@standard-schema/spec";

import { type IStartable } from "./i-startable.ts";
import type { ConfigValue } from "./config-value.ts";
import type { ServiceIdentifier } from "inversify";

export interface IBootstrapper {
  configValue<TConfigValue extends StandardSchemaV1>(
    key: string,
    schema: TConfigValue,
  ): ConfigValue<StandardSchemaV1.InferOutput<TConfigValue>>;

  addInitStep(callback: () => Promise<void>): void;

  addEntryPoint(service: ServiceIdentifier<IStartable>): void;

  start(): Promise<void>;
}

export const BootstrapperToken: ServiceIdentifier<IBootstrapper> =
  Symbol.for("Bootstrapper");
