export interface ISingleItemStore<T extends object | undefined> {
  get(): Promise<T | undefined>;
  set(thing: T): Promise<void>;
}
