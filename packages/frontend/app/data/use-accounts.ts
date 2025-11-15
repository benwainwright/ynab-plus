import { useEffect, useState, useTransition } from "react";

import { command } from "./command.ts";
import { Account } from "@ynab-plus/domain";

export const useAccounts = () => {
  const [isPending, startTransition] = useTransition();
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    void (async () => {
      await command("SyncAccountsCommand", undefined);
    })();

    startTransition(async () => {
      setAccounts(await command("ListAccountsCommand", undefined));
    });
  }, []);

  return { isPending, accounts };
};
