import type { ISerialisable } from "./i-serialisable.ts";
import { transactionSchema, type ITransaction } from "./i-transaction.ts";

export class Transaction
  implements ITransaction, ISerialisable<ITransaction, "transaction">
{
  public readonly id: string;
  public readonly accountId: string;
  public readonly date: Date;
  public readonly amount: number;
  public readonly cleared: boolean;
  public readonly memo: string;
  public readonly approved: boolean;

  public readonly $type = "transaction";

  public constructor(config: ITransaction) {
    this.id = config.id;
    this.amount = config.amount;
    this.accountId = config.accountId;
    this.approved = config.approved;
    this.cleared = config.cleared;
    this.date = config.date;
    this.memo = config.memo;
  }

  public toObject(): ITransaction & { $type: "transaction" } {
    return this;
  }

  public static fromObject(thing: unknown) {
    const data = transactionSchema.parse(thing);
    return new Transaction(data);
  }
}
