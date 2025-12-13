import { Image, Card, Text } from "@mantine/core";
import type { BankConnection } from "@ynab-plus/domain";
import type { ReactNode } from "react";

interface BankCardProps {
  institution: BankConnection;
}

export const BankCard = ({ institution }: BankCardProps): ReactNode => {
  return (
    <Card shadow="sm" p={"lg"}>
      <Card.Section>
        <Image
          mt="md"
          radius="md"
          src={institution.logo}
          h="100"
          fit="contain"
          alt={`${institution.bankName} logo`}
        />
      </Card.Section>
      <Text mt="md" style={{ textAlign: "center" }}>
        {institution.bankName}
      </Text>
    </Card>
  );
};
