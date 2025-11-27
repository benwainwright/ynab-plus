import type { Account, OauthToken } from "@ynab-plus/domain";
import type { ServiceIdentifier } from "inversify";

export interface IAccountsFetcher {
  getAccounts(token: OauthToken): Promise<Account[]>;
}

export const AccountsFetcherToken: ServiceIdentifier<IAccountsFetcher> =
  Symbol.for("AccountsFetcher");
