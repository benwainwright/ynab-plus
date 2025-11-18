export interface IMultipleRepository<T extends { id: string }> {
  getMany(start?: number, limit?: number): Promise<T[]>;
}
