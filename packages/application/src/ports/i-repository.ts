export interface IRepository<T extends { id: string }> {
  get(id: string): Promise<T | undefined>;
  save(thing: T): Promise<T>;
  delete(thing: T): Promise<void>;
}
