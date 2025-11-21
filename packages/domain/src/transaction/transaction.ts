import { DomainModel } from "@core";
import { transactionSchema, type ITransaction } from "./i-transaction.ts";

export class Transaction extends DomainModel implements ITransaction {
  public readonly id: string;
  public readonly accountId: string;
  public readonly date: Date;
  public readonly amount: number;
  public readonly cleared: "cleared" | "uncleared" | "reconciled";
  public readonly memo: string | undefined;
  public readonly approved: boolean;

  public constructor(config: ITransaction) {
    super();
    this.id = config.id;
    this.amount = config.amount;
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
