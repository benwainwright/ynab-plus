export interface ISessionStorage<T extends object> {
  getSessionId(): string;
  get(): Promise<T>;
  set(thing: T): Promise<void>;
}
