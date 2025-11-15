import { type IAccount } from "@ynab-plus/domain";
import { useEffect, useState, useTransition } from "react";

import { command } from "./command.ts";
import { useEvent } from "./use-event.ts";

export const useAccounts = () => {
  const [isPending, startTransition] = useTransition();
  const [accounts, setAccounts] = useState<IAccount[]>([]);

  useEffect(() => {
    void (async () => {
      await command("SyncAccountsCommand", { force: false });
    })();

    startTransition(async () => {
      setAccounts(await command("ListAccountsCommand", undefined));
    });
  }, []);

  useEvent("AccountsSynced", (data) => {
    setAccounts(data);
  });

  return { isPending, accounts };
};
