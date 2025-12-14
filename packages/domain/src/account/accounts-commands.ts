import type { Account } from "./account.ts";

export interface AccountsCommands {
  CompareBalanceCommand: {
    request: {
      id: string;
    };
    response:
      | { status: "no_link" }
      | { status: "no_bank_connection" }
      | { status: "balances_match" }
      | { status: "balance_mismatch" };
  };
  SyncAccountCommand: {
    request: {
      id: string;
    };
    response: { success: false; reason: string } | { success: true };
  };
  SyncAccountsCommand: {
    request: { force: boolean };
    response: { synced: boolean };
  };
  ListAccountsCommand: {
    request: undefined;
    response: Account[];
  };
}
