import type { Oauth2IntegrationStatusConnected } from "@data";
import { SimpleGrid, Text } from "@mantine/core";
import { DateTime } from "luxon";

const dateFormat = {
  weekday: "short",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
} as const;

interface ConnectedIntegrationStatusBodyProps {
  status: Oauth2IntegrationStatusConnected;
}

export const ConnectedIntegrationStatusBody = ({
  status,
}: ConnectedIntegrationStatusBodyProps) => {
  return (
    <SimpleGrid cols={2}>
      <Text fw={500}>Connected</Text>
      <div>
        {DateTime.fromJSDate(new Date(status.created)).toLocaleString(
          dateFormat,
        )}
      </div>
      {status.refreshed ? (
        <>
          <Text fw={500}>Last Refresh</Text>
          <div>
            {DateTime.fromJSDate(new Date(status.refreshed)).toLocaleString(
              dateFormat,
            )}
          </div>
        </>
      ) : null}
      <Text fw={500}>Expires</Text>
      <div>
        {DateTime.fromJSDate(new Date(status.expiry)).toLocaleString(
          dateFormat,
        )}
      </div>
    </SimpleGrid>
  );
};
