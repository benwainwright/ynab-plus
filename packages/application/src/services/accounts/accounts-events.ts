import type { Account } from "@ynab-plus/domain";

export interface AccountsEvents {
  AccountsSynced: Account[];
  AccountSyncStarted: { accountId: string };
  AccountSyncFinished: { accountId: string };
  AccountsSyncStarted: undefined;
  AccountsSyncFinished: undefined;
}
