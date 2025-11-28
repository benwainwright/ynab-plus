import type { Account } from "@ynab-plus/domain";
import type { ICreatable } from "./i-creatable.ts";

export interface IAccountRepository extends ICreatable {
  getAccounts(id: string): Promise<Account | undefined>;
  getUserAccounts(userId: string): Promise<Account[]>;
  saveAccount(account: Account): Promise<Account>;
  deleteAccount(account: Account): Promise<void>;
  saveAccounts(account: Account[]): Promise<Account[]>;
}
