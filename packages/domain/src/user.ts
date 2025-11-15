import type { IUser } from "./i-user.ts";
import type { Permission } from "./permissions.ts";

export class User implements IUser {
  public readonly id: string;
  private _passwordHash: string;
  private _email: string;
  private _permissions: Permission[];

  public constructor(config: {
    id: string;
    passwordHash: string;
    email: string;
    permissions: Permission[];
  }) {
    this.id = config.id;
    this._passwordHash = config.passwordHash;
    this._email = config.email;
    this._permissions = config.permissions;
  }

  public get passwordHash() {
    return this._passwordHash;
  }

  public get email() {
    return this._email;
  }

  public get permissions() {
    return this._permissions;
  }

  public set permissions(permissions: Permission[]) {
    this._permissions = permissions;
  }

  public set passwordHash(hash: string) {
    this._passwordHash = hash;
  }

  public set email(email: string) {
    this._email = email;
  }
}
