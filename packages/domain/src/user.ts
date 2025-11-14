import type { IUser } from "./i-user.ts";
import type { Permission } from "./permissions.ts";

export class User implements IUser {
  public readonly id: string;
  public readonly passwordHash: string;
  public readonly email: string;
  public readonly permissions: Permission[];

  public constructor(config: {
    id: string;
    passwordHash: string;
    email: string;
    permissions: Permission[];
  }) {
    this.id = config.id;
    this.passwordHash = config.passwordHash;
    this.email = config.email;
    this.permissions = config.permissions;
  }
}
