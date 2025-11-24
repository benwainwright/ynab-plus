import type { BankConnection } from "@ynab-plus/domain";

export interface IInstitutionAuthPageLinkFetcher {
  getLink(connection: BankConnection): Promise<string>;
}
