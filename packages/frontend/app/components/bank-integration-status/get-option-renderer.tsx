import {
  Text,
  Avatar,
  Group,
  type ComboboxStringItem,
  type RenderAutocompleteOption
} from "@mantine/core";
import type { BankConnection } from "@ynab-plus/domain";

type OptionRendererFactory = (institutions: BankConnection[]) => RenderAutocompleteOption;

export const getOptionRenderer: OptionRendererFactory = (instititions: BankConnection[]) => {
  const instititionMap = new Map<string, BankConnection>();

  instititions.forEach((bank) => instititionMap.set(bank.bankName, bank));

  return ({ option }: { option: ComboboxStringItem }) => {
    return (
      <Group gap="sm">
        <Avatar src={instititionMap.get(option.value)?.logo ?? ""} size={36} radius="xl" />
        <Text>{instititionMap.get(option.value)?.bankName}</Text>
      </Group>
    );
  };
};
