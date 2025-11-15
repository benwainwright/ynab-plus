import { Account } from "@ynab-plus/domain";
import { useEffect, useState, useTransition } from "react";

import { command } from "./command.ts";

export const useAccounts = () => {
  const [isPending, startTransition] = useTransition();
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    void (async () => {
      await command("SyncAccountsCommand", { force: false });
    })();

    startTransition(async () => {
      setAccounts(await command("ListAccountsCommand", undefined));
    });
  }, []);

  return { isPending, accounts };
};
