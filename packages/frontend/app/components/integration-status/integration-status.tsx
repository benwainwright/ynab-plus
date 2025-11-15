import { useOauth2IntegrationStatus } from "@data";
import { DateTime } from "luxon";

const dateFormat = {
  weekday: "short",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
} as const;

interface IntegrationStatusProps {
  provider: string;
}

export const IntegrationStatus = ({ provider }: IntegrationStatusProps) => {
  const { status } = useOauth2IntegrationStatus({
    provider,
  });

  if (status.status === "connected") {
    return (
      <tr>
        <td>YNAB</td>
        <td>Connected!</td>
        <td>
          {DateTime.fromJSDate(new Date(status.created)).toLocaleString(
            dateFormat,
          )}
        </td>
        <td>
          {status.refreshed
            ? DateTime.fromJSDate(new Date(status.refreshed)).toLocaleString(
                dateFormat,
              )
            : "N/A"}
        </td>
        <td>
          {DateTime.fromJSDate(new Date(status.expiry)).toLocaleString(
            dateFormat,
          )}
        </td>
      </tr>
    );
  }

  if (status.status === "loading") {
    return (
      <tr>
        <td colSpan={5}>Loading</td>
      </tr>
    );
  }

  if (status.redirectUrl) {
    return (
      <tr>
        <td>YNAB</td>
        <td colSpan={4}>
          <a href={status.redirectUrl}>connect</a>
        </td>
      </tr>
    );
  }

  return <>Checking</>;
};
