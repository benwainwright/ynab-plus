import { type IAccount } from "@ynab-plus/domain";
import { useEffect, useState, useTransition } from "react";

import { command } from "./command.ts";
import { useEvent } from "./use-event.ts";

export const useAccounts = () => {
  const [syncing, setSyncing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [accounts, setAccounts] = useState<IAccount[]>([]);

  useEvent("AccountsSyncStarted", () => {
    setSyncing(true);
  });

  useEvent("AccountsSyncFinished", () => {
    startTransition(async () => {
      setAccounts(await command("ListAccountsCommand", undefined));
      setSyncing(false);
    });
  });

  const triggerSync = async () => {
    await command("SyncAccountsCommand", { force: false });
  };

  useEffect(() => {
    void (async () => {
      await command("SyncAccountsCommand", { force: false });
    })();
  }, []);

  useEvent("AccountsSynced", (data) => {
    setAccounts(data);
  });

  return { isPending, accounts, sync: triggerSync, syncing };
};
