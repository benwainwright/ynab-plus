import type { IRepository } from "./i-repository.ts";

export interface IUserRepositoryStore<T extends { id: string }> {
  getRepo(userId: string): IRepository<T>;
}
