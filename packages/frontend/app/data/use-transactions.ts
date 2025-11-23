import { type ITransaction } from "@ynab-plus/domain";
import { useEffect, useState, useTransition } from "react";

import { command } from "./command.ts";
import { useSearchParams } from "react-router";

const PER_PAGE = 20;

export const useTransactions = (accountId?: string) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageQueryParam = Number(searchParams.get("page") ?? "1");
  const [page, setPage] = useState<number>(pageQueryParam);
  const [isPending, startTransition] = useTransition();
  const [transactions, setTransactions] = useState<{
    transactions: ITransaction[];
    count: number;
  }>();

  useEffect(() => {
    setSearchParams({ page: String(page) });
    startTransition(async () => {
      if (accountId) {
        setTransactions(
          await command("ListTransactionsCommand", {
            accountId,
            offset: (page - 1) * PER_PAGE,
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
