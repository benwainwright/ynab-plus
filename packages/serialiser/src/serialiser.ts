import {
  Account,
  BankConnection,
  SyncDetails,
  User,
  RegularTask,
  OauthToken,
  type IAccount,
  type ISyncDetails,
  type IBankConnection,
  type IUser,
  type IOauthToken,
  type IRegularTask,
  type SchedulableTask
} from "@ynab-plus/domain";
import { Typeson } from "typeson";

export class Serialiser {
  private registry = new Typeson();

  private identifier = () => {};

  public constructor() {
    this.registry.register({
      syncDetails: [
        (thing) => thing instanceof SyncDetails,
        (details: SyncDetails) => details.freezeDry(),
        (raw: ISyncDetails) => SyncDetails.reconstitute(raw)
      ],
      account: [
        (thing) => thing instanceof Account,
        (account: Account) => account.freezeDry(),
        (raw: IAccount) => Account.reconstitute(raw)
      ],
      task: [
        (thing) => thing instanceof RegularTask,
        (task: RegularTask) => task.freezeDry(),
        (raw: IRegularTask<SchedulableTask>) => RegularTask.reconstitute(raw)
      ],
      user: [
        (thing) => thing instanceof User,
        (user: User) => user.freezeDry(),
        (raw: IUser) => User.reconstitute(raw)
      ],
      bankConnection: [
        (thing) => thing instanceof BankConnection,
        (connection: BankConnection) => connection.freezeDry(),
        (raw: IBankConnection) => BankConnection.reconstite(raw)
      ],
      token: [
        (thing) => thing instanceof OauthToken,
        (token: OauthToken) => token.freezeDry(),
        (raw: IOauthToken) => OauthToken.reconstitute(raw)
      ]
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
