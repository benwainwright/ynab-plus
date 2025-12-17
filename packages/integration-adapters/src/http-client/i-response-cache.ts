export interface IResponseCache<T> {
  set(key: string, value: T, ttl?: number): Promise<void>;
  get(key: string): Promise<T | undefined>;
  prune(): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}
