import type { Account } from "./account.ts";

export interface AccountEvents {
  AccountCreated: Account;
  AccountDeleted: Account;
}
