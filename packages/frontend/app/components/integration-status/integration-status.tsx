import { useOauth2IntegrationStatus } from "@data";

interface IntegrationStatusProps {
  provider: "ynab";
}

export const IntegrationStatus = ({ provider }: IntegrationStatusProps) => {
  const { status } = useOauth2IntegrationStatus({
    provider,
  });

  if (status.status === "connected") {
    return <>Connected!</>;
  }

  if (status.status === "loading") {
    return <>Loading</>;
  }

  if (status.redirectUrl) {
    return (
      <>
        <a href={status.redirectUrl}>connect</a>
      </>
    );
  }

  return <>Checking</>;
};
