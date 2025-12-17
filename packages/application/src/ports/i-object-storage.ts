export interface IObjectStorage {
  listKeys(namespace: string): Promise<string[]>;
  get(namespace: string, key: string): Promise<string | undefined>;
  set(namespace: string, key: string, thing: string | undefined): Promise<void>;
  clear(namespace: string): Promise<void>;
}
