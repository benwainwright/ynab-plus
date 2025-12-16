import { command } from "@data";
import { Button, Group, SimpleGrid, Text } from "@mantine/core";
import { DateTime } from "luxon";
import type { ReactNode } from "react";

const dateFormat = {
  weekday: "short",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
} as const;

interface BankConnectionConnectionDetails {
  status: "connected";
  logo: string;
  bankName: string;
  connected: Date;
  refreshed: Date | undefined;
  expires: Date;
}

interface BankConnectedIntegrationStatusBodyProps {
  status: BankConnectionConnectionDetails;
}

export const BankConnectedIntegrationStatusBody = ({
  status,
}: BankConnectedIntegrationStatusBodyProps): ReactNode => {
  const disconnect = async () => {
    await command("DisconnectBankCoonnectionCommand", undefined);
  };

  return (
    <>
      <SimpleGrid cols={2}>
        <Text fw={500}>Connected</Text>
        <div style={{ textAlign: "right", marginRight: "1rem" }}>
          {DateTime.fromJSDate(new Date(status.connected)).toLocaleString(dateFormat)}
        </div>
        {status.refreshed ? (
          <>
            <Text fw={500}>Last Refresh</Text>
            <div style={{ textAlign: "right", marginRight: "1rem" }}>
              {DateTime.fromJSDate(new Date(status.refreshed)).toLocaleString(dateFormat)}
            </div>
          </>
        ) : null}
        <Text fw={500}>Expires</Text>
        <div style={{ textAlign: "right", marginRight: "1rem" }}>
          {DateTime.fromJSDate(new Date(status.expires)).toLocaleString(dateFormat)}
        </div>
      </SimpleGrid>
      <Group justify="flex-end">
        <Button
          mt="lg"
          color="red"
          size="sm"
          mr="lg"
          onClick={() => {
            disconnect().catch((error: unknown) => {
              console.log(error);
            });
          }}
        >
          Disconnect
        </Button>
      </Group>
    </>
  );
};
