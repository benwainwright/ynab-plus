import type { Transaction } from "@ynab-plus/domain";

export interface ITransactionRepository {
  getTransaction(id: string): Promise<Transaction>;

  saveTransaction(transaction: Transaction): Promise<void>;

  getAccountTransactions(
    accountId: string,
    limit: number,
    offset: number,
  ): Promise<Transaction[]>;

  saveAccountTransactions(
    accountId: string,
    transactions: Transaction[],
  ): Promise<void>;
}
