import { useLinkedAccount } from "@data";
import { Button } from "@mantine/core";
import type { ReactNode } from "react";

interface BalanceCheckButtonProps {
  accountId: string | undefined;
}

export const BalanceCheckButton = ({ accountId }: BalanceCheckButtonProps): ReactNode => {
  const { balanceCheckResult } = useLinkedAccount(accountId);

  if (!balanceCheckResult || balanceCheckResult.status === "no_bank_connection") {
    return null;
  }

  if (balanceCheckResult.status === "no_link") {
    return (
      <Button variant="light" size="xs">
        Link Account
      </Button>
    );
  }

  if (balanceCheckResult.status === "balances_match") {
    return <p>Balances match!</p>;
  }

  return (
    <Button variant="light" size="xs">
      Reconcile mismatch
    </Button>
  );
};
