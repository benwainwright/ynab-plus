import { userSchema, type IUser } from "./i-user.ts";
import { DomainModel, type Permission, type IRole } from "@core";

export class User extends DomainModel<IUser> implements IUser, IRole {
  public override freezeDry(config?: { secure: boolean }): {
    id: string;
    passwordHash: string;
    email: string;
    permissions: ("public" | "user" | "admin" | "system")[];
  } {
    return {
      id: this.id,
      passwordHash: config?.secure ? this._passwordHash : ``,
      email: this._email,
      permissions: this._permissions
    };
  }

  public readonly id: string;
  private _passwordHash: string;
  private _email: string;
  private _permissions: Permission[];

  private constructor(config: IUser) {
    super();
    this.id = config.id;
    this._passwordHash = config.passwordHash;
    this._email = config.email;
    this._permissions = config.permissions;
  }

  public static create(config: { id: string; passwordHash: string; email: string }) {
    const user = new User({ ...config, permissions: ["user"] });
    user.raiseEvent({ event: "UserCreated", data: user });
    return user;
  }

  public delete() {
    this.raiseEvent({ event: "UserDeleted", data: this });
  }

  public static reconstitute(data: IUser): User {
    return new User(userSchema.parse(data));
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

  public update({
    permissions,
    hash,
    email
  }: {
    permissions?: Permission[];
    hash?: string;
    email?: string;
  }) {
    const old = User.reconstitute(this);
    this._permissions = permissions ?? this._permissions;
    this._passwordHash = hash ?? this._passwordHash;
    this._email = email ?? this._email;
    this.raiseEvent({ event: "UserUpdated", data: { old, new: this } });
  }
}
