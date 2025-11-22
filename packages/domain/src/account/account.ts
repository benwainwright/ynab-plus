import { DomainModel } from "@core";
import { accountSchema, type IAccount } from "./i-account.ts";

export class Account extends DomainModel implements IAccount {
  public readonly id: string;

  public readonly userId: string;
  public readonly name: string;
  public readonly closed: boolean;
  public readonly note: string | undefined;
  public readonly type: string;
  public readonly deleted: boolean;

  private constructor(config: IAccount) {
    super();
    this.id = config.id;
    this.userId = config.userId;
    this.name = config.name;
    this.type = config.type;
    this.closed = config.closed;
    this.note = config.note;
    this.deleted = config.deleted;
  }

  public delete() {
    this.raiseEvent({ event: "AccountDeleted", data: this });
  }

  public static reconstitute(
    config: Omit<IAccount, "note"> & { note?: string | undefined | null },
  ) {
    return new Account(accountSchema.parse(config));
  }

  public static create(config: IAccount) {
    const theAccount = new Account(config);
    theAccount.raiseEvent({ event: "AccountCreated", data: theAccount });
    return theAccount;
  }
}
