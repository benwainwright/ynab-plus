import type { ISerialisable } from "./i-serialisable.ts";
import { type IUser, userSchema } from "./i-user.ts";
import type { Permission } from "./permissions.ts";

export class User implements IUser, ISerialisable<IUser, "user"> {
  public readonly id: string;
  private _passwordHash: string;
  private _email: string;
  private _permissions: Permission[];

  public readonly $type = "user" as const;

  public constructor(config: IUser) {
    this.id = config.id;
    this._passwordHash = config.passwordHash;
    this._email = config.email;
    this._permissions = config.permissions;
  }

  public toObject() {
    return {
      $type: this.$type,
      id: this.id,
      passwordHash: this.passwordHash,
      email: this.email,
      permissions: this.permissions,
    };
  }

  public static fromObject(data: unknown) {
    const parsed = userSchema.parse(data);
    return new User(parsed);
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
