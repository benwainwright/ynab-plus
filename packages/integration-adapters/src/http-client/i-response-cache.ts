export interface IResponseCache<T> {
  set(key: string, value: T, ttl?: number): void;
  get(key: string): T | undefined;
  delete(key: string): void;
  clear(): void;
}
