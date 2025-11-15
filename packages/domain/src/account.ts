import type { IAccount } from "./i-account.ts";

export class Account implements IAccount {
  public readonly id: string;
  public readonly userId: string;
  public readonly name: string;
  public readonly type: string;
  public readonly closed: boolean;
  public readonly note: string | undefined;
  public readonly deleted: boolean;

  public constructor(config: IAccount) {
    this.id = config.id;
    this.userId = config.userId;
    this.name = config.name;
    this.type = config.type;
    this.closed = config.closed;
    this.note = config.note;
    this.deleted = config.deleted;
  }
}
