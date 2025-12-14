import { HttpError } from "@errors";
import type { IAccountsFetcher, ITransactionFetcher } from "@ynab-plus/app";
import { type ILogger } from "@ynab-plus/bootstrap";
import { Account, SyncDetails, Transaction, type OauthToken } from "@ynab-plus/domain";
import { injectable } from "inversify";
import { inject } from "@core";

import z from "zod";

const LOG_CONTEXT = { context: "ynab-client" };

@injectable()
export class YnabClient implements IAccountsFetcher, ITransactionFetcher {
  public constructor(
    @inject("Logger")
    private logger: ILogger,
  ) {}

  private async request({
    path,
    token,
    method,
    syncDetails,
  }: {
    path: string;
    token: OauthToken;
    method: "GET" | "POST";
    syncDetails: SyncDetails | undefined;
  }) {
    const knowledgeString =
      syncDetails && syncDetails.checkpoint
        ? `?last_knowledge_of_server=${String(syncDetails.checkpoint)}`
        : ``;

    const url = `https://api.ynab.com/v1${path}${knowledgeString}`;

    token.lastUse = new Date();

    const headers = {
      Authorization: `Bearer ${token.use()}`,
      accept: "application/json",
    };

    const config = {
      method,
      headers,
    };

    this.logger.silly(`Sending request to ${url} with ${JSON.stringify(config)}`, LOG_CONTEXT);

    const result = await fetch(url, { method, headers });

    if (!result.ok) {
      const text = await result.text();
      throw new HttpError(`Request failed: ${text}`, result.status, text);
    }

    return (await result.json()) as unknown;
  }

  public async getAccountTransactions(
    token: OauthToken,
    accountId: string,
    syncDetails: SyncDetails,
  ): Promise<Transaction[]> {
    const path = `/budgets/default/accounts/${accountId}/transactions`;

    const result = await this.request({
      token,
      method: "GET",
      path,
      syncDetails,
    });

    const parsedResult = z
      .object({
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
      })
      .parse(result);

    syncDetails.checkpoint = String(parsedResult.data.server_knowledge);

    return parsedResult.data.transactions;
  }

  async getAccounts(token: OauthToken, syncDetails?: SyncDetails) {
    const result = await this.request({
      method: "GET",
      path: "/budgets/default/accounts",
      token,
      syncDetails,
    });

    const parsed = z
      .object({
        data: z.object({
          accounts: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              type: z.string(),
              closed: z.boolean(),
              note: z.union([z.string(), z.null()]),
              deleted: z.boolean(),
              balance: z.number(),
              cleared_balance: z.number(),
              uncleared_balance: z.number(),
            }),
          ),
        }),
      })
      .parse(result);

    return parsed.data.accounts.map((account) =>
      Account.reconstitute({
        ...account,
        userId: token.userId,
        clearedBalance: account.cleared_balance,
        unclearedBalance: account.uncleared_balance,
      }),
    );
  }
}
