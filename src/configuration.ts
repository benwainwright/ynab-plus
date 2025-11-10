import { join } from "path";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { IConfigurator } from "./i-configurator.ts";
import { cwd } from "process";
import { readFileSync } from "fs";

export class JsonFileConfigReader implements IConfigurator {
  private _config: Record<string, unknown>;

  public constructor(filePath: string) {
    const configFilePath = join(cwd(), filePath);
    this._config = JSON.parse(readFileSync(configFilePath, "utf-8"));
  }

  async getConfig<TConfigValue extends StandardSchemaV1>(
    key: string,
    schema: TConfigValue,
  ): Promise<StandardSchemaV1.InferOutput<TConfigValue>> {
    const value = this._config[key];

    let result = schema["~standard"].validate(value);

    if (result instanceof Promise) {
      result = await result;
    }

    if (result.issues) {
      throw new Error(JSON.stringify(result.issues, null, 2));
    }

    return result.value;
  }
}
