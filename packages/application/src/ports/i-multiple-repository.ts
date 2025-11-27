import type { ICreatable } from "./i-creatable.ts";

export interface IMultipleRepository<T extends { id: string }>
  extends ICreatable {
  getMany(start?: number, limit?: number): Promise<T[]>;
}
