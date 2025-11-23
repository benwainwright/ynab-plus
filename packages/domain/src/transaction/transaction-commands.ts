import { Transaction } from "./transaction.ts";
export interface TransactionCommands {
  ListTransactionsCommand: {
    request: {
      accountId: string;
      offset: number;
      limit: number;
    };
    response: { transactions: Transaction[]; count: number };
  };
}
