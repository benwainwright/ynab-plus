import { HttpError } from "@errors";
import type { IAccountsFetcher, ITransactionFetcher } from "@ynab-plus/app";
import type { ILogger } from "@ynab-plus/bootstrap";
import {
  Account,
  SyncDetails,
  Transaction,
  type OauthToken,
} from "@ynab-plus/domain";
import z from "zod";

const LOG_CONTEXT = { context: "ynab-client" };

export class YnabClient implements IAccountsFetcher, ITransactionFetcher {
  public constructor(
    private baseUrl: string,
    private logger: ILogger,
  ) {}

  private async request({
    path,
    token,
    method,
  }: {
    path: string;
    token: OauthToken;
    method: "GET" | "POST";
  }) {
    const url = `${this.baseUrl}/v1${path}`;

    token.lastUse = new Date();

    const headers = {
      Authorization: `Bearer ${token.token}`,
      accept: "application/json",
    };

    const config = {
      method,
      headers,
    };

    this.logger.silly(
      `Sending request to ${url} with ${JSON.stringify(config)}`,
      LOG_CONTEXT,
    );

    const result = await fetch(url, { method, headers });

    if (!result.ok) {
      throw new HttpError(`Request failed`, result.status, await result.text());
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
                payee_id: z.string(),
                payee_name: z.string(),
                category_id: z.string().nullable(),
                category_name: z.string(),
                transfer_account_id: z.string(),
                transfer_transaction_id: z.string(),
                matched_transaction_id: z.string().nullable(),
                import_id: z.string(),
                import_payee_name: z.string(),
                import_payee_name_original: z.string(),
                debt_transaction_type: z.string().nullable(),
                deleted: z.boolean(),
              })
              .transform(
                (item) =>
                  new Transaction({
                    ...item,
                    accountId: item.account_id,
                    memo: item.memo ?? undefined,
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

  async getAccounts(token: OauthToken) {
    const result = await this.request({
      method: "GET",
      path: "/budgets/default/accounts",
      token,
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
            }),
          ),
        }),
      })
      .parse(result);

    return parsed.data.accounts.map(
      (account) =>
        new Account({
          ...account,
          userId: token.userId,
          note: account.note ?? undefined,
        }),
    );
  }
}
