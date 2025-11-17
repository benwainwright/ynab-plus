import type { Permission } from "./permissions.ts";

export interface IRole {
  id: string;
  permissions: Permission[];
}
