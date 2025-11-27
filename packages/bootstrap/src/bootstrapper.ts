import type { StandardSchemaV1 } from "@standard-schema/spec";
import EventEmitter from "events";
import { readFileSync } from "fs";
import { join } from "path";
import { cwd } from "process";
import z, { ZodError } from "zod";

import { ConfigValue } from "./config-value.ts";
import type { IBootstrapper } from "./i-bootstrapper.ts";
import { LoggerToken, type ILogger } from "./i-logger.ts";
import {
  Container,
  inject,
  injectable,
  type ServiceIdentifier,
} from "inversify";
import type { IStartable } from "./i-startable.ts";
import { ApplicationContainerToken } from "./application-container-token.ts";

export const LOG_CONTEXT = { context: "bootstrapper" };

const RESOLVE_CONFIG = "resolve-config";

export const BootstrapConfigFileToken: ServiceIdentifier<string> = Symbol.for(
  "BootstrapConfigFileToken",
);

@injectable()
export class Bootstrapper implements IBootstrapper {
  private bootstrappingSteps: (() => Promise<void>)[] = [];
  private emitter = new EventEmitter();
  private fullSchema: Record<string, StandardSchemaV1> = {};

  private _config: Record<string, unknown>;

  public constructor(
    @inject(BootstrapConfigFileToken)
    private configFile: string,

    @inject(LoggerToken)
    private logger: ILogger,

    @inject(ApplicationContainerToken)
    private container: Container,
  ) {
    this.logger.silly("Initialising bootstrapper", {
      context: "bootstrapper",
    });
    const configFilePath = join(cwd(), this.configFile);

    this._config = JSON.parse(readFileSync(configFilePath, "utf-8")) as Record<
      string,
      unknown
    >;
  }

  public addEntryPoint(service: ServiceIdentifier<IStartable>): void {
    this.addInitStep(async () => {
      const startable = await this.container.getAsync(service);
      this.logger.info(`Starting ${startable.name}`, LOG_CONTEXT);
      await startable.start();
    });
  }

  public addInitStep(callback: () => Promise<void>) {
    this.bootstrappingSteps.push(callback);
  }

  public async start(): Promise<void> {
    this.logger.debug(`Starting application`, LOG_CONTEXT);
    try {
      z.object(this.fullSchema).parse(this._config);
    } catch (error) {
      if (error instanceof ZodError) {
        this.logger.error(z.prettifyError(error), LOG_CONTEXT);
        return;
      }
    }

    this.logger.debug(
      `Application config ${JSON.stringify(this._config)}`,
      LOG_CONTEXT,
    );

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
    >((accept) =>
      this.emitter.on(RESOLVE_CONFIG, () => {
        accept(value);
      }),
    );

    return new ConfigValue(valuePromise);
  }
}
