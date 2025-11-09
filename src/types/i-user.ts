import type { Permission } from "./permissions.ts";

export interface IUser {
  id: string;
  passwordHash: string;
  email: string;
  permissions: Permission[];
}
