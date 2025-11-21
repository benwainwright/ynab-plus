import { Account, User, type IAccount, type IUser } from "@ynab-plus/domain";
import { Typeson } from "typeson";

export class Serialiser {
  private registry = new Typeson();

  public constructor() {
    this.registry.register({
      account: [
        (thing) => thing instanceof Account,
        (account: Account): IAccount => ({
          id: account.id,
          userId: account.userId,
          name: account.name,
          type: account.type,
          closed: account.closed,
          note: account.note,
          deleted: account.deleted,
        }),
        (raw: IAccount) => Account.reconstitute(raw),
      ],
      user: [
        (thing) => thing instanceof User,
        (user: User): IUser => ({
          id: user.id,
          permissions: user.permissions,
          email: user.email,
          passwordHash: user.passwordHash,
        }),
        (raw: IUser) => User.reconstitute(raw),
      ],
    });
  }

  public async serialise(thing: unknown): Promise<string> {
    return await this.registry.stringify(thing);
  }

  public async deserialise(data: string): Promise<unknown> {
    return await this.registry.parse(data);
  }
}
