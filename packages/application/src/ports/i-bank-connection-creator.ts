import type { BankConnection, OauthToken } from "@ynab-plus/domain";

export interface IBankConnectionCreator {
  getConnections(userId: string, token: OauthToken): Promise<BankConnection[]>;
}
