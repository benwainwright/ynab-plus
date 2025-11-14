export interface ISingleItemStore<T extends object> {
  get(): Promise<T | undefined>;
  set(thing: T | undefined): Promise<void>;
}
