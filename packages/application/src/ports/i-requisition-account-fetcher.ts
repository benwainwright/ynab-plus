import type { BankConnection } from "@ynab-plus/domain";

export interface IRequesitionAccountFetcher {
  getAccountIds(bankConnection: BankConnection): Promise<string[]>;
}
