import { useEffect, useState } from "react";

import { command } from "./command.ts";
import type { BankConnection } from "@ynab-plus/domain";
import { useEvent } from "./use-event.ts";

export type BankConnectionConnected = {
  status: "connected";
  logo: string;
  bankName: string;
  connected: Date;
  refreshed: Date | undefined;
  expires: Date;
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
  const [dirty, setDirty] = useState(true);

  const [status, setStatus] = useState<BankConnectionStatus>({
    status: "loading",
  });

  useEvent("BankConnectionDeleted", () => {
    setDirty(true);
  });

  useEffect(() => {
    if (dirty) {
      void (async () => {
        setStatus(await command("CheckBankConnectionCommand", undefined));
      })();
    }
  }, [dirty]);

  return { status };
};
