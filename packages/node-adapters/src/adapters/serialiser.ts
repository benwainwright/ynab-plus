import {
  Account,
  OauthToken,
  RegularTask,
  Transaction,
  User,
  type IAccount,
  type IOauthToken,
  type IRegularTask,
  type ITransaction,
  type IUser,
  type SchedulableTask,
} from "@ynab-plus/domain";
import { Typeson } from "typeson";

export class Serialiser {
  private registry = new Typeson();

  public constructor() {
    this.registry.register({
      token: [
        (thing) => thing instanceof OauthToken,
        (token: OauthToken): IOauthToken => ({
          refreshToken: token.refreshToken,
          provider: token.provider,
          userId: token.userId,
          expiry: token.expiry,
          token: token.token,
          lastUse: token.lastUse,
          refreshed: token.refreshed,
          created: token.created,
        }),
      ],
      regularTask: [
        (thing) => thing instanceof RegularTask,
        (task: RegularTask): IRegularTask<SchedulableTask> => ({
          id: task.id,
          created: task.created,
          triggerImmediately: task.triggerImmediately,
          lastExecution: task.lastExecution,
          onBehalfOf: task.onBehalfOf,
          data: task.data,
          hour: task.hour,
          minute: task.minute,
          day: task.day,
          month: task.month,
          weekDay: task.weekDay,
          name: task.name,
          description: task.description,
          command: task.command,
        }),
      ],
      transaction: [
        (thing) => thing instanceof Transaction,
        (transaction: Transaction): ITransaction => ({
          id: transaction.id,
          accountId: transaction.accountId,
          payee: transaction.payee,
          date: transaction.date,
          amount: transaction.amount,
          cleared: transaction.cleared,
          memo: transaction.memo,
          approved: transaction.approved,
        }),
        (raw: ITransaction) => Transaction.reconstitute(raw),
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

  public async serialise(thing: unknown): Promise<string> {
    return await this.registry.stringify(thing);
  }

  public async deserialise(data: string): Promise<unknown> {
    return await this.registry.parse(data);
  }
}
