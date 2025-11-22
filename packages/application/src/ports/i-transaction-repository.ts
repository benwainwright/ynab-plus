import type { Transaction } from "@ynab-plus/domain";

export interface ITransactionRepository {
  getTransaction(id: string): Promise<Transaction | undefined>;
  saveTransaction(transaction: Transaction): Promise<Transaction>;

  getAccountTransactionCount(accountId: string): Promise<number>;

  getAccountTransactions(
    accountId: string,
    offset: number,
    limit: number,
  ): Promise<Transaction[]>;

  saveTransactions(transactions: Transaction[]): Promise<Transaction[]>;
}
