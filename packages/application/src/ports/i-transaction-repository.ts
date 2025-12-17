import type { Transaction } from "@ynab-plus/domain";
import type { ICreatable } from "./i-creatable.ts";

export interface ITransactionRepository extends ICreatable {
  getTransaction(id: string): Promise<Transaction | undefined>;
  saveTransaction(transaction: Transaction): Promise<Transaction>;

  getAccountTransactionCount(userId: string, accountId: string): Promise<number>;

  getAccountTransactions(
    userId: string,
    accountId: string,
    offset: number,
    limit: number
  ): Promise<Transaction[]>;

  saveTransactions(transactions: Transaction[]): Promise<Transaction[]>;
}
