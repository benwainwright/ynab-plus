import type { BankConnection } from "node_modules/@ynab-plus/domain/src/bank-connection/bank-connection.ts";

export interface IBankConnectionRepository {
  getConnection(userId: string): Promise<BankConnection | undefined>;
}
