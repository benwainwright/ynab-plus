import { useEffect } from "react";

import { command } from "./command.ts";

export const useTransactions = () => {
  useEffect(() => {
    void (async () => {
      await command("DownloadAccountsCommand", undefined);
    })();
  }, []);
};
