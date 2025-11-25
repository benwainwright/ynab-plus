import type { Transaction } from "@ynab-plus/domain";

export interface ITransactionRepository {
  getTransaction(id: string): Promise<Transaction | undefined>;
  saveTransaction(transaction: Transaction): Promise<Transaction>;

  getAccountTransactionCount(
    userId: string,
    accountId: string,
  ): Promise<number>;

  getAccountTransactions(
    userId: string,
    accountId: string,
    offset: number,
    limit: number,
  ): Promise<Transaction[]>;

  saveTransactions(transactions: Transaction[]): Promise<Transaction[]>;
}

export const TransactionRepositoryToken = Symbol.for(
  "TransactionRepositoryToken",
);
