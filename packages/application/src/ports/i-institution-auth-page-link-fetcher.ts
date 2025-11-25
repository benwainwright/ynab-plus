import type { BankConnection } from "@ynab-plus/domain";

export interface IInstitutionAuthPageLinkFetcher {
  getLink(
    connection: BankConnection,
  ): Promise<{ requsitionId: string; url: string }>;
}

export const InstitutionAuthPageLinkFetcherToken = Symbol.for(
  "InstitutionAuthPageLinkFetcher",
);
