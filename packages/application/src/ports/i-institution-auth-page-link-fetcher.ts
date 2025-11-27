import type { BankConnection } from "@ynab-plus/domain";
import type { ServiceIdentifier } from "inversify";

export interface IInstitutionAuthPageLinkFetcher {
  getLink(
    connection: BankConnection,
  ): Promise<{ requsitionId: string; url: string }>;
}

export const InstitutionAuthPageLinkFetcherToken: ServiceIdentifier<IInstitutionAuthPageLinkFetcher> =
  Symbol.for("InstitutionAuthPageLinkFetcher");
