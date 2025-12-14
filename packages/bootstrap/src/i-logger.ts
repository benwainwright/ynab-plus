/* eslint-disable @typescript-eslint/no-unnecessary-type-parameters */

import type { ServiceIdentifier } from "inversify";

export interface ILogger {
  child<TContext extends object>(context: TContext): ILogger;

  error<TData extends { context: string }>(message: string, data: TData): void;

  warn<TData extends { context: string }>(message: string, data: TData): void;

  info<TData extends { context: string }>(message: string, data: TData): void;

  debug<TData extends { context: string }>(message: string, data: TData): void;

  verbose<TData extends { context: string }>(message: string, data: TData): void;

  silly<TData extends { context: string }>(message: string, data: TData): void;
}

export const LoggerToken: ServiceIdentifier<ILogger> = Symbol.for("Logger");
