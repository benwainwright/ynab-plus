import { BankIntegrationStatus, IntegrationStatus, Page } from "@components";
import { Stack } from "@mantine/core";
import type { ReactNode } from "react";

export const Integrations = (): ReactNode => {
  return (
    <Page routeName="integrations">
      <Stack>
        <IntegrationStatus provider="ynab" title="YNAB" />
        <BankIntegrationStatus />
      </Stack>
    </Page>
  );
};

export default Integrations;
