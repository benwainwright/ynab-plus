import type { BankConnection, OauthToken } from "@ynab-plus/domain";

export interface IRequesitionAccountFetcher {
  getAccountIds(bankConnection: BankConnection, token: OauthToken): Promise<string[]>;
}
