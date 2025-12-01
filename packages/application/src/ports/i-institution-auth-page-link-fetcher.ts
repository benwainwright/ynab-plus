import type { BankConnection, OauthToken } from "@ynab-plus/domain";

export interface IInstitutionAuthPageLinkFetcher {
  getLink(
    connection: BankConnection,
    token: OauthToken,
  ): Promise<{ requsitionId: string; url: string }>;
}
