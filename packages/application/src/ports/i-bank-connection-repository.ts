import type { BankConnection } from "node_modules/@ynab-plus/domain/src/bank-connection/bank-connection.ts";

export interface IBankConnectionRepository {
  getConnection(userId: string): Promise<BankConnection | undefined>;
  saveConnection(connection: BankConnection): Promise<BankConnection>;
  deleteConnection(connection: BankConnection): Promise<void>;
}

export const BankConnectionRepositoryToken = Symbol.for(
  "BankConnectionRepository",
);
