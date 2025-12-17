import { useEffect, useState } from "react";
import { command } from "./command.ts";
import type { Commands } from "@ynab-plus/domain";

export const useLinkedAccount = (id: string | undefined) => {
  const [dirty, setDirty] = useState(true);
  const [balanceCheckResult, setBalanceCheckResult] =
    useState<Commands["CompareBalanceCommand"]["response"]>();

  const linkAccount = async (ynabAccount: string, obAccount: string) => {
    await command("LinkAccountCommand", { ynabAccount, obAccount });
    setDirty(true);
  };

  useEffect(() => {
    void (async () => {
      if (id && dirty) {
        const result = await command("CompareBalanceCommand", { id });
        setBalanceCheckResult(result);
        setDirty(false);
      }
    })();
  }, [id, dirty]);

  return { balanceCheckResult, linkAccount, loading: dirty };
};
