import type { BankConnection } from "@ynab-plus/domain";

export interface IBankConnectionCreator {
  getConnections(userId: string): Promise<BankConnection[]>;
}
