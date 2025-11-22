import { type ITransaction } from "@ynab-plus/domain";
import { useEffect, useState, useTransition } from "react";

import { command } from "./command.ts";

const PER_PAGE = 30;

export const useTransactions = (accountId?: string) => {
  const [page, setPage] = useState<number>(0);
  const [isPending, startTransition] = useTransition();
  const [transactions, setTransactions] = useState<{
    transactions: ITransaction[];
    count: number;
  }>();

  useEffect(() => {
    startTransition(async () => {
      if (accountId) {
        setTransactions(
          await command("ListTransactionsCommand", {
            accountId,
            offset: page * 30,
            limit: PER_PAGE,
          }),
        );
      }
    });
  }, [accountId, page]);

  return {
    isPending,
    transactions: transactions?.transactions,
    page,
    setPage,
    totalPages: (transactions?.count ?? 0) / PER_PAGE,
  };
};
