export interface IRepository<T extends { id: string }> {
  getMany(start?: number, limit?: number): Promise<T[]>;
  get(id: string): Promise<T | undefined>;
  save(thing: T): Promise<T>;
}
