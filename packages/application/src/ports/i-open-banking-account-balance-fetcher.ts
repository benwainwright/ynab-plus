import type { OauthToken } from "@ynab-plus/domain";

export interface IOpenBankingAccountBalanceFetcher {
  getAccountBalance(id: string, token: OauthToken): Promise<number>;
}
