import type { OauthToken, SyncDetails, Transaction } from "@ynab-plus/domain";
import type { ServiceIdentifier } from "inversify";

export interface ITransactionFetcher {
  getAccountTransactions(
    token: OauthToken,
    accountId: string,
    syncDetails: SyncDetails,
    sinceDate?: Date,
  ): Promise<Transaction[]>;
}

export const TransactionFetcherToken: ServiceIdentifier<ITransactionFetcher> =
  Symbol.for("TransactionFetcher");
