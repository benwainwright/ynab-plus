import type { ICreatable } from "./i-creatable.ts";

export interface IRepository<T extends { id: string }> extends ICreatable {
  get(id: string): Promise<T | undefined>;
  save(thing: T): Promise<T>;
  delete(thing: T): Promise<void>;
}
