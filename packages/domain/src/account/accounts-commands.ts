import type { Account } from "./account.ts";

export interface AccountsCommands {
  CompareBalanceCommand: {
    request: {
      id: string;
    };
    response:
      | { status: "no_link" }
      | { status: "no_bank_connection" }
      | { status: "balances_match"; balance: number }
      | {
          status: "balance_mismatch";
          ynabBalance: number;
          bankBalance: number;
        };
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
