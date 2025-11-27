import type { OauthToken, SyncDetails, Transaction } from "@ynab-plus/domain";

export interface ITransactionFetcher {
  getAccountTransactions(
    token: OauthToken,
    accountId: string,
    syncDetails: SyncDetails,
    sinceDate?: Date,
  ): Promise<Transaction[]>;
}
