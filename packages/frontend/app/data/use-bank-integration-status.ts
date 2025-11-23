import { useEffect, useState } from "react";

import { command } from "./command.ts";
import type { BankConnection } from "@ynab-plus/domain";

export type BankConnectionConnected = {
  status: "connected";
};

export type BankConnectionNeedsToSelectInstitution = {
  status: "new";
  potentialInstitutions: BankConnection[];
};

export type BankConnectionLoading = {
  status: "loading";
};

export type BankConnectionStatus =
  | BankConnectionConnected
  | BankConnectionNeedsToSelectInstitution
  | BankConnectionLoading;

export const useBankIntegrationStatus = () => {
  const [status, setStatus] = useState<BankConnectionStatus>({
    status: "loading",
  });

  useEffect(() => {
    void (async () => {
      setStatus(await command("CheckBankConnectionCommand", undefined));
    })();
  }, []);

  return { status };
};
