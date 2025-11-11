import type { IConfigValue } from "./i-config-value.ts";

export class ConfigValue<T> implements IConfigValue<T> {
  public constructor(public readonly value: Promise<T>) {}
}
