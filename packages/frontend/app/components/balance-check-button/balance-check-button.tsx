import { useLinkedAccount } from "@data";
import { Button, Loader, Text } from "@mantine/core";
import type { ReactNode } from "react";
import { LinkAccountButton } from "@components";

interface BalanceCheckButtonProps {
  accountId: string | undefined;
}

export const BalanceCheckButton = ({ accountId }: BalanceCheckButtonProps): ReactNode => {
  const { balanceCheckResult, linkAccount, loading } = useLinkedAccount(accountId);

  if (loading) {
    return <Loader></Loader>;
  }

  if (!balanceCheckResult || balanceCheckResult.status === "no_bank_connection") {
    return null;
  }

  if (balanceCheckResult.status === "no_link" && accountId) {
    return (
      <LinkAccountButton
        onPick={async (id) => {
          await linkAccount(accountId, id);
        }}
      />
    );
  }

  if (balanceCheckResult.status === "balances_match") {
    return <Text>Balances match!</Text>;
  }

  return (
    <Button variant="light" size="xs">
      Reconcile
    </Button>
  );
};
