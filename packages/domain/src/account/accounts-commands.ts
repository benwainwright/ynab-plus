import type { Account } from "./account.ts";

export interface AccountsCommands {
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
