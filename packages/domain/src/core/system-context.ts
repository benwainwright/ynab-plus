import type { IRole } from "./i-role.ts";
import type { Permission } from "./permissions.ts";
import type { User } from "@user";

export class SystemContext implements IRole {
  public constructor(
    public readonly id: string,
    public readonly permissions: Permission[],
    public readonly onBehalfOf?: User
  ) {}
}
