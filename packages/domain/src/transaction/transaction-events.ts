import type { Transaction } from "./transaction.ts";

export interface TransactionEvents {
  TransactionCreated: Transaction;
  TransactionDeleted: Transaction;
}
