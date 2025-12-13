import { command, type Oauth2IntegrationStatusConnected } from "@data";
import { SimpleGrid, Text, Button, Group } from "@mantine/core";
import { DateTime } from "luxon";
import type { ReactNode } from "react";

const dateFormat = {
  weekday: "short",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
} as const;

interface ConnectedIntegrationStatusBodyProps {
  provider: string;
  status: Oauth2IntegrationStatusConnected;
}

export const ConnectedIntegrationStatusBody = ({
  provider,
  status,
}: ConnectedIntegrationStatusBodyProps): ReactNode => {
  const disconnect = async () => {
    await command("DisconnectOauthIntegrationCommand", { provider });
  };

  return (
    <>
      <SimpleGrid cols={2}>
        <Text fw={500}>Connected</Text>
        <div style={{ textAlign: "right", marginRight: "1rem" }}>
          {DateTime.fromJSDate(new Date(status.created)).toLocaleString(
            dateFormat,
          )}
        </div>
        {status.refreshed ? (
          <>
            <Text fw={500}>Last Refresh</Text>
            <div style={{ textAlign: "right", marginRight: "1rem" }}>
              {DateTime.fromJSDate(new Date(status.refreshed)).toLocaleString(
                dateFormat,
              )}
            </div>
          </>
        ) : null}
        <Text fw={500}>Expires</Text>
        <div style={{ textAlign: "right", marginRight: "1rem" }}>
          {DateTime.fromJSDate(new Date(status.expiry)).toLocaleString(
            dateFormat,
          )}
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
