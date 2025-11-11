export interface IConfigValue<T> {
  readonly value: Promise<T>;
}
