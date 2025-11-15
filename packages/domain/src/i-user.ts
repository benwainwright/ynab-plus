import type { Permission } from "./permissions.ts";

export interface IUser {
  readonly id: string;
  readonly passwordHash: string;
  readonly email: string;
  readonly permissions: Permission[];
}
