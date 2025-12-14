import { useEffect, useState } from "react";
import { command } from "./command.ts";
import type { Commands } from "@ynab-plus/domain";

export const useLinkedAccount = (id: string | undefined) => {
  const [balanceCheckResult, setBalanceCheckResult] =
    useState<Commands["CompareBalanceCommand"]["response"]>();

  useEffect(() => {
    void (async () => {
      if (id) {
        const result = await command("CompareBalanceCommand", { id });
        setBalanceCheckResult(result);
      }
    })();
  }, [id]);

  return { balanceCheckResult };
};
