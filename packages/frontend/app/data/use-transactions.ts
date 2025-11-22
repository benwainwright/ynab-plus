import { type ITransaction } from "@ynab-plus/domain";
import { useEffect, useState, useTransition } from "react";

import { command } from "./command.ts";

export const useTransactions = (
  offset: number,
  limit: number,
  accountId?: string,
) => {
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
            offset,
            limit,
          }),
        );
      }
    });
  }, [accountId, offset, limit]);

  return {
    isPending,
    transactions: transactions?.transactions,
    count: transactions?.count,
  };
};
