import { join } from "path";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { IBootstrapper } from "./i-bootstrapper.ts";
import { cwd } from "process";
import { readFileSync } from "fs";
import EventEmitter from "events";
import z, { ZodError } from "zod";
import { ConfigValue } from "./config-value.ts";
import type { ILogger } from "./i-logger.ts";

const RESOLVE_CONFIG = "resolve-config";

export class Bootstrapper implements IBootstrapper {
  private bootstrappingSteps: (() => Promise<void>)[] = [];
  private emitter = new EventEmitter();
  private fullSchema: Record<string, StandardSchemaV1> = {};

  private _config: Record<string, unknown>;

  public constructor(private config: { configFile: string; logger: ILogger }) {
    this.config.logger.silly("Initialising bootstrapper", {
      context: "bootstrapper",
    });
    const configFilePath = join(cwd(), config.configFile);
    this._config = JSON.parse(readFileSync(configFilePath, "utf-8"));
  }

  public async addInitStep(callback: () => Promise<void>) {
    this.bootstrappingSteps.push(callback);
  }

  public async start(): Promise<void> {
    try {
      z.object(this.fullSchema).parse(this._config);
    } catch (error) {
      if (error instanceof ZodError) {
        console.log(z.prettifyError(error));
        return;
      }
    }

    this.emitter.emit(RESOLVE_CONFIG);
    await this.bootstrappingSteps.reduce(async (last, current) => {
      await last;
      await current();
    }, Promise.resolve());
  }

  public configValue<TConfigValue extends StandardSchemaV1>(
    key: string,
    schema: TConfigValue,
  ): ConfigValue<StandardSchemaV1.InferOutput<TConfigValue>> {
    const value = this._config[key];
    this.fullSchema[key] = schema;

    const valuePromise = new Promise<
      StandardSchemaV1.InferOutput<TConfigValue>
    >((accept) => this.emitter.on(RESOLVE_CONFIG, () => accept(value)));

    return new ConfigValue(valuePromise);
  }
}
