import type { ILogger } from "@ynab-plus/bootstrap";
import { Account, type OauthToken } from "@ynab-plus/domain";
import z from "zod";

import { HttpError } from "../http-error.ts";

const LOG_CONTEXT = { context: "ynab-client" };

export class YnabClient {
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
