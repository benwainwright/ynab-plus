import type { Permission } from "./permissions.ts";

export interface IUser {
  readonly id: string;
  passwordHash: string;
  email: string;
  permissions: Permission[];
}
