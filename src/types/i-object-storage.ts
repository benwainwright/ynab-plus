export interface IObjectStorage {
  get(key: string): Promise<object | undefined>;
  set(key: string, thing: object): Promise<void>;
}
