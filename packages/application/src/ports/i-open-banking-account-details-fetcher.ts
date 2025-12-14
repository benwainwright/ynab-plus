import type { OauthToken } from "@ynab-plus/domain";

export interface IOpenBankingAccountDetailsFetcher {
  getAccountDetails(
    ids: string[],
    token: OauthToken,
  ): Promise<
    {
      created: Date;
      id: string;
      name: string;
      institutionId: string;
    }[]
  >;
}
