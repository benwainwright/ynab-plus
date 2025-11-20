import type { Transaction } from "@ynab-plus/domain";

export interface ITransactionRepository {
  getTransaction(id: string): Promise<Transaction | undefined>;
  saveTransaction(transaction: Transaction): Promise<Transaction>;

  getAccountTransactions(
    accountId: string,
    limit: number,
    offset: number,
  ): Promise<Transaction[]>;

  saveTransactions(transactions: Transaction[]): Promise<Transaction[]>;
}
