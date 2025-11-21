import {
  Account,
  SyncDetails,
  User,
  type IAccount,
  type ISyncDetails,
  type IUser,
} from "@ynab-plus/domain";
import { Typeson } from "typeson";

export class Serialiser {
  private registry = new Typeson();

  public constructor() {
    this.registry.register({
      syncDetails: [
        (thing) => thing instanceof SyncDetails,
        (details: SyncDetails): ISyncDetails => ({
          id: details.id,
          checkpoint: details.checkpoint,
          lastSync: details.lastSync,
          provider: details.provider,
        }),
        (raw: ISyncDetails) => SyncDetails.reconstitute(raw),
      ],
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

  public serialise(thing: unknown): string {
    const result = this.registry.stringify(thing);
    if (result instanceof Promise) {
      throw new Error(`Typeson returned promise`);
    }
    return result;
  }

  public deserialise(data: string): unknown {
    return this.registry.parse(data);
  }
}
