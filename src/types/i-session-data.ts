import type { Permission } from "./permissions.ts";

export interface ISessionData {
  userId: string | undefined;
  permissions: Permission[] | undefined;
}
