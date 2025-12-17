import { command } from "@data";
import { Button, Combobox, Input, InputBase, useCombobox } from "@mantine/core";
import { type Commands } from "@ynab-plus/domain";
import { useEffect, useState, type ReactNode } from "react";

export const LinkAccountButton = (): ReactNode => {
  const [isLinking, setIsLinking] = useState(false);
  const [requisitionAccounts, setRequisitionAccounts] =
    useState<Commands["ListRequisitionAccountsCommand"]["response"]>();

  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption();
    },
  });

  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      if (isLinking) {
        const result = await command(
          "ListRequisitionAccountsCommand",
          undefined,
        );
        setRequisitionAccounts(result);
      }
    })();
  }, [isLinking]);

  if (isLinking && requisitionAccounts) {
    const options = requisitionAccounts.map((item) => (
      <Combobox.Option value={item.id} key={item.id}>
        {item.name}
      </Combobox.Option>
    ));

    const item = requisitionAccounts.find((item) => item.id === value);

    return (
      <Combobox
        store={combobox}
        onOptionSubmit={(val) => {
          setValue(val);
          combobox.closeDropdown();
        }}
      >
        <Combobox.Target>
          <InputBase
            component="button"
            type="button"
            pointer
            rightSection={<Combobox.Chevron />}
            rightSectionPointerEvents="none"
            onClick={() => {
              combobox.toggleDropdown();
            }}
          >
            {item?.name || <Input.Placeholder>Pick value</Input.Placeholder>}
          </InputBase>
        </Combobox.Target>
        <Combobox.Dropdown>
          <Combobox.Options>{options}</Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
    );
  }

  return (
    <Button
      variant="light"
      size="xs"
      onClick={() => {
        setIsLinking(true);
      }}
    >
      Link Account
    </Button>
  );
};
