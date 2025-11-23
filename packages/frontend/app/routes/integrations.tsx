import { BankIntegrationStatus, IntegrationStatus, Page } from "@components";
import { Stack } from "@mantine/core";

export const Integrations = () => {
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
