export interface ISingleItemStore<T extends object> {
  get(): Promise<T | undefined>;
  require(): Promise<T>;
  set(thing: T | undefined): Promise<void>;
}
