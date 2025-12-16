import { type IAccount } from "@ynab-plus/domain";
import { useEffect, useState, useTransition } from "react";

import { command } from "./command.ts";
import { useEvent } from "./use-event.ts";

export const useAccounts = () => {
  const [syncing, setSyncing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [accounts, setAccounts] = useState<IAccount[]>([]);
  const [dirty, setDirty] = useState(true);

  useEvent("AccountsSyncStarted", () => {
    setSyncing(true);
  });

  const triggerSync = async () => {
    await command("SyncAccountsCommand", { force: false });
  };

  useEffect(() => {
    void (async () => {
      await command("SyncAccountsCommand", { force: false });
    })();

    if (dirty) {
      startTransition(async () => {
        setAccounts(await command("ListAccountsCommand", undefined));
        setDirty(false);
      });
    }
  }, [dirty]);

  useEvent("AccountsSyncFinished", () => {
    setSyncing(false);
  });

  return { isPending, accounts, sync: triggerSync, syncing };
};
