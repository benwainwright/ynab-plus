import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { IConfigValue } from "./i-config-value.ts";

export interface IBootstrapper {
  configValue<TConfigValue extends StandardSchemaV1>(
    key: string,
    schema: TConfigValue,
  ): IConfigValue<StandardSchemaV1.InferOutput<TConfigValue>>;

  start(): void;

  addInitStep(callback: () => Promise<void>): void;
}
