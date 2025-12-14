import type { OauthToken } from "@ynab-plus/domain";

export interface IOpenBankingAccountDetailsFetcher {
  getAccountDetails(
    ids: string[],
    token: OauthToken,
  ): Promise<
    {
      id: string;
      name: string | undefined;
    }[]
  >;
}
