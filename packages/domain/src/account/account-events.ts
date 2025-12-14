import type { Account } from "./account.ts";

export interface AccountEvents {
  AccountCreated: Account;
  AccountDeleted: Account;
  AccountBalanceUpdated: { old: Account; new: Account };
}
