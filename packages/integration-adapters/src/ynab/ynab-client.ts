import type { IAccountsFetcher, ITransactionFetcher } from "@ynab-plus/app";
import { type ILogger } from "@ynab-plus/bootstrap";
import { Account, SyncDetails, Transaction, type OauthToken } from "@ynab-plus/domain";
import { injectable } from "inversify";
import { inject } from "@core";

import z from "zod";
import { HttpClient, type IResponseCache } from "@http-client";

@injectable()
export class YnabClient implements IAccountsFetcher, ITransactionFetcher {
  private client: HttpClient;

  public constructor(
    @inject("ResponseCache")
    private responseCache: IResponseCache<unknown>,

    @inject("Logger")
    private logger: ILogger,
  ) {
    this.client = new HttpClient({
      baseUrl: `https://api.ynab.com/v1`,
      logger,
      defaultTtl: 1000 * 20,
      responseCache,
      defaultHeaders: {
        accept: "application/json",
        "content-type": "application/json",
      },
    });
  }

  public async getAccountTransactions(
    token: OauthToken,
    accountId: string,
    syncDetails: SyncDetails,
  ): Promise<Transaction[]> {
    const queryString =
      syncDetails && syncDetails.checkpoint
        ? { last_knowledge_of_server: syncDetails.checkpoint }
        : {};

    const result = await this.client.get({
      path: `/budgets/default/accounts/${accountId}/transactions`,
      queryString,
      ttl: 1000 * 5,
      headers: {
        Authorization: `Bearer ${token.use()}`,
      },
      responseSchema: z.object({
        data: z.object({
          transactions: z.array(
            z
              .object({
                id: z.string(),
                date: z.string().transform((item) => new Date(item)),
                amount: z.number(),
                memo: z.string().nullable(),
                cleared: z.union([
                  z.literal("cleared"),
                  z.literal("uncleared"),
                  z.literal("reconciled"),
                ]),
                approved: z.boolean(),
                flag_color: z.string().nullable(),
                flag_name: z.string().nullable(),
                account_id: z.string(),
                account_name: z.string(),
                payee_id: z.union([z.string(), z.null()]),
                payee_name: z.union([z.string(), z.null()]),
                category_id: z.string().nullable(),
                category_name: z.string(),
                transfer_account_id: z.union([z.string(), z.null()]),
                transfer_transaction_id: z.union([z.string(), z.null()]),
                matched_transaction_id: z.string().nullable(),
                import_id: z.union([z.string(), z.null()]),
                import_payee_name: z.union([z.string(), z.null()]),
                import_payee_name_original: z.union([z.string(), z.null()]),
                debt_transaction_type: z.string().nullable(),
                deleted: z.boolean(),
              })
              .transform((item) =>
                Transaction.reconstitute({
                  ...item,
                  userId: token.userId,
                  accountId: item.account_id,
                  memo: item.memo ?? undefined,
                  payee: item.payee_name ?? "",
                }),
              ),
          ),
          server_knowledge: z.number(),
        }),
      }),
    });

    syncDetails.checkpoint = String(result.data.server_knowledge);
    return result.data.transactions;
  }

  async getAccounts(token: OauthToken, syncDetails?: SyncDetails) {
    const queryString =
      syncDetails && syncDetails.checkpoint
        ? { last_knowledge_of_server: syncDetails.checkpoint }
        : {};

    const result = await this.client.get({
      path: "/budgets/default/accounts",
      ttl: 1000 * 60 * 5,
      headers: {
        Authorization: `Bearer ${token.use()}`,
      },
      queryString,
      responseSchema: z.object({
        data: z.object({
          accounts: z.array(
            z
              .object({
                id: z.string(),
                name: z.string(),
                type: z.string(),
                closed: z.boolean(),
                note: z.union([z.string(), z.null()]),
                deleted: z.boolean(),
                balance: z.number(),
                cleared_balance: z.number(),
                uncleared_balance: z.number(),
              })
              .transform((account) => {
                return Account.reconstitute({
                  ...account,
                  userId: token.userId,
                  clearedBalance: account.cleared_balance,
                  unclearedBalance: account.uncleared_balance,
                });
              }),
          ),
        }),
      }),
    });

    return result.data.accounts;
  }
}
