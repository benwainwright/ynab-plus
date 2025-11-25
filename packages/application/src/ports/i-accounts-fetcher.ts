import type { Account, OauthToken } from "@ynab-plus/domain";

export interface IAccountsFetcher {
  getAccounts(token: OauthToken): Promise<Account[]>;
}

export const AccountsFetcherToken = Symbol.for("AccountsFetcher");
