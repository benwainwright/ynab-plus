export class ConfigValue<T> {
  public constructor(public readonly value: Promise<T>) {}
}
