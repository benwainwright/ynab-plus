export interface IStore<T extends object> {
  get(): Promise<T | undefined>;
  set(thing: T): Promise<void>;
}
