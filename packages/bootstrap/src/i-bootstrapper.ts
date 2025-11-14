import type { StandardSchemaV1 } from "@standard-schema/spec";

import type { ConfigValue } from "./config-value.ts";

export interface IBootstrapper {
  configValue<TConfigValue extends StandardSchemaV1>(
    key: string,
    schema: TConfigValue,
  ): ConfigValue<StandardSchemaV1.InferOutput<TConfigValue>>;

  addInitStep(callback: () => Promise<void>): void;
}
