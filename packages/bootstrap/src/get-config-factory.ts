import type { StandardSchemaV1 } from "@standard-schema/spec";
import { type Factory, type ResolutionContext } from "inversify";
import { BootstrapperToken, type IBootstrapper } from "./i-bootstrapper.ts";

export const getConfigValueFactory = <TSchema extends StandardSchemaV1>(
  keyName: string,
  schema: TSchema
): Factory<StandardSchemaV1.InferOutput<TSchema>> => {
  return (context: ResolutionContext) => {
    const bootstrapper = context.get<IBootstrapper>(BootstrapperToken);

    return bootstrapper.configValue<TSchema>(keyName, schema);
  };
};
