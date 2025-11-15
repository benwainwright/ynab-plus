import type { Account } from "@ynab-plus/domain";

export interface IAccountRepository {
  get(id: string): Promise<Account | undefined>;
  getUserAccounts(userId: string): Promise<Account[]>;
  save(account: Account): Promise<Account>;
  saveMany(account: Account[]): Promise<Account[]>;
}
