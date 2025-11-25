import type { Account } from "@ynab-plus/domain";

export const AccountRepositoryToken = Symbol.for("IAccountRepository");

export interface IAccountRepository {
  getAccounts(id: string): Promise<Account | undefined>;
  getUserAccounts(userId: string): Promise<Account[]>;
  saveAccount(account: Account): Promise<Account>;
  deleteAccount(account: Account): Promise<void>;
  saveAccounts(account: Account[]): Promise<Account[]>;
}
