import { DomainModel } from "@core";
import { transactionSchema, type ITransaction } from "./i-transaction.ts";

export class Transaction
  extends DomainModel<ITransaction>
  implements ITransaction
{
  public override freezeDry(_config?: { secure: boolean }): {
    id: string;
    accountId: string;
    userId: string;
    date: Date;
    payee: string;
    amount: number;
    cleared: "cleared" | "uncleared" | "reconciled";
    approved: boolean;
    memo?: string | undefined;
  } {
    return {
      id: this.id,
      accountId: this.accountId,
      userId: this.userId,
      date: this.date,
      payee: this.payee,
      amount: this.amount,
      cleared: this.cleared,
      approved: this.approved,
      memo: this.memo,
    };
  }

  public readonly id: string;
  public readonly userId: string;
  public readonly accountId: string;
  public readonly date: Date;
  public readonly amount: number;
  public readonly payee: string;
  public readonly cleared: "cleared" | "uncleared" | "reconciled";
  public readonly memo: string | undefined;
  public readonly approved: boolean;

  private constructor(config: ITransaction) {
    super();
    this.id = config.id;
    this.userId = config.userId;
    this.amount = config.amount;
    this.payee = config.payee;
    this.accountId = config.accountId;
    this.approved = config.approved;
    this.cleared = config.cleared;
    this.date = config.date;
    this.memo = config.memo;
  }

  public delete() {
    this.raiseEvent({ event: "TransactionDeleted", data: this });
  }

  public static create(config: ITransaction) {
    const newTx = new Transaction(config);
    newTx.raiseEvent({ event: "TransactionCreated", data: newTx });
    return newTx;
  }

  public static reconstitute(config: ITransaction) {
    return new Transaction(transactionSchema.parse(config));
  }
}
