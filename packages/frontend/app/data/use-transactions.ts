import { type ITransaction } from "@ynab-plus/domain";
import { useEffect, useState, useTransition } from "react";

import { command } from "./command.ts";
import { useSearchParams } from "react-router";
import { useEvents } from "./use-events.ts";

const PER_PAGE = 20;

export const useTransactions = (accountId?: string) => {
  const [syncing, setSyncing] = useState<boolean>(false);
  const [dirty, setDirty] = useState(true);

  useEvents((event) => {
    if (event.key === "AccountSyncStarted" && event.data.accountId === accountId) {
      setSyncing(true);
    }
    if (event.key === "AccountSyncFinished" && event.data.accountId === accountId) {
      setSyncing(false);
      setDirty(true);
    }
  });

  const triggerSync = async () => {
    if (accountId) {
      await command("SyncAccountCommand", { id: accountId });
    }
  };

  const [searchParams, setSearchParams] = useSearchParams();
  const pageQueryParam = Number(searchParams.get("page") ?? "1");
  const [page, setPage] = useState<number>(pageQueryParam);
  const [isPending, startTransition] = useTransition();
  const [transactions, setTransactions] = useState<{
    transactions: ITransaction[];
    count: number;
    accountName: string;
  }>();

  useEffect(() => {
    setSearchParams({ page: String(page) });
    if (dirty) {
      startTransition(async () => {
        if (accountId) {
          setTransactions(
            await command("ListTransactionsCommand", {
              accountId,
              offset: (page - 1) * PER_PAGE,
              limit: PER_PAGE
            })
          );
        }
      });
      setDirty(false);
    }
  }, [accountId, page, dirty]);

  return {
    isPending,
    transactions: transactions?.transactions,
    name: transactions?.accountName,
    page,
    setPage: (page: number) => {
      setPage(page);
      setDirty(true);
    },
    totalPages: (transactions?.count ?? 0) / PER_PAGE,
    syncing,
    sync: triggerSync
  };
};
