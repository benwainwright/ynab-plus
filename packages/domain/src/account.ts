import { accountSchema, type IAccount } from "./i-account.ts";
import type { ISerialisable } from "./i-serialisable.ts";

export class Account implements IAccount, ISerialisable<IAccount, "account"> {
  public readonly id: string;

  public readonly userId: string;
  public readonly name: string;
  public readonly closed: boolean;
  public readonly note: string | undefined;
  public readonly type: string;
  public readonly deleted: boolean;

  public readonly $type = "account";

  public constructor(config: IAccount) {
    this.id = config.id;
    this.userId = config.userId;
    this.name = config.name;
    this.type = config.type;
    this.closed = config.closed;
    this.note = config.note;
    this.deleted = config.deleted;
  }

  public toObject(): IAccount & { $type: "account" } {
    return this;
  }

  public static fromObject(thing: unknown) {
    const data = accountSchema.parse(thing);
    return new Account(data);
  }
}
