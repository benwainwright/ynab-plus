import { useOauth2IntegrationStatus } from "@data";
import { Card, Group, LoadingOverlay, Title } from "@mantine/core";
import { IconCircleCheckFilled } from "@tabler/icons-react";
import { RedirectButton } from "./redirect-button.tsx";
import { ConnectedIntegrationStatusBody } from "./connected-integration-status-body.tsx";

interface IntegrationStatusProps {
  title: string;
  provider: string;
}

export const IntegrationStatus = ({
  provider,
  title,
}: IntegrationStatusProps) => {
  const { status } = useOauth2IntegrationStatus({
    provider,
  });

  const titleColor = status.status === "connected" ? "green" : "black";

  return (
    <Card withBorder radius="md" padding="md" maw="30rem" shadow="sm">
      <LoadingOverlay
        visible={status.status === "loading"}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
      />
      <Card.Section withBorder inheritPadding py="xs">
        <Group justify="space-between">
          <Title style={{ color: titleColor }} order={3}>
            {title}
          </Title>
          {status.status === "connected" ? (
            <IconCircleCheckFilled size={30} color={titleColor} />
          ) : (
            <RedirectButton status={status} />
          )}
        </Group>
      </Card.Section>

      {status.status === "connected" && (
        <Card.Section py="xs" ml="xs" mt="x">
          <ConnectedIntegrationStatusBody status={status} provider={provider} />
        </Card.Section>
      )}
    </Card>
  );
};
