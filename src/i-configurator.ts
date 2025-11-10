import type { StandardSchemaV1 } from "@standard-schema/spec";

export interface IConfigurator {
  getConfig<TConfigValue extends StandardSchemaV1>(
    key: string,
    schema: TConfigValue,
  ): Promise<StandardSchemaV1.InferOutput<TConfigValue>>;
}
