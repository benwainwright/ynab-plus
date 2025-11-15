import type { Account } from "@ynab-plus/domain";

export interface IAccountRepository {
  get(id: string): Promise<Account>;
  getUserAccounts(userId: string): Promise<Account[]>;
  save(account: Account): Promise<Account>;
}
