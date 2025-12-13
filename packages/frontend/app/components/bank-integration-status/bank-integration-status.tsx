import { useBankIntegrationStatus } from "@data";
import { Card, Group, LoadingOverlay, Title } from "@mantine/core";
import { IconCircleCheckFilled } from "@tabler/icons-react";
import { SelectInstitutionButton } from "./select-institution-button.tsx";
import type { ReactNode } from "react";

export const BankIntegrationStatus = (): ReactNode => {
  const { status } = useBankIntegrationStatus();

  return (
    <Card withBorder radius="md" padding="md" maw="30rem" shadow="sm">
      <LoadingOverlay
        visible={status.status === "loading"}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
      />
      <Card.Section withBorder inheritPadding py="xs">
        <Group justify="space-between">
          <Title order={3}>Bank</Title>
          {status.status === "connected" ? (
            <IconCircleCheckFilled size={30} color={"green"} />
          ) : status.status !== "loading" ? (
            <SelectInstitutionButton
              institutions={status.potentialInstitutions}
            />
          ) : null}
        </Group>
      </Card.Section>

      {status.status === "connected" && (
        <Card.Section py="xs" ml="xs" mt="x">
          Connected
        </Card.Section>
      )}
    </Card>
  );
};
