export interface IObjectStorage {
  get(key: string): Promise<string | undefined>;
  set(key: string, thing: string | undefined): Promise<void>;
}
