import { command } from "@data";
import { Button, Combobox, Input, InputBase, useCombobox } from "@mantine/core";
import { type Commands } from "@ynab-plus/domain";
import { useEffect, useState, type ReactNode } from "react";

interface LinkAccountButtonProps {
  onPick: (id: string) => void | Promise<void>;
}

export const LinkAccountButton = ({ onPick }: LinkAccountButtonProps): ReactNode => {
  const [isLinking, setIsLinking] = useState(false);
  const [requisitionAccounts, setRequisitionAccounts] =
    useState<Commands["ListRequisitionAccountsCommand"]["response"]>();

  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption();
    }
  });

  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      if (isLinking) {
        const result = await command("ListRequisitionAccountsCommand", undefined);
        setRequisitionAccounts(result);
      }
    })();
  }, [isLinking]);

  if (isLinking && requisitionAccounts) {
    const options = requisitionAccounts.map((item) => (
      <Combobox.Option value={item.id} key={item.id}>
        {item.name ?? item.details}
      </Combobox.Option>
    ));

    return (
      <Combobox
        store={combobox}
        // oxlint-disable eslint/no-misused-promises
        onOptionSubmit={async (val) => {
          await onPick(val);
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
            {value ? <div aria-busy></div> : <Input.Placeholder>Pick value</Input.Placeholder>}
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
