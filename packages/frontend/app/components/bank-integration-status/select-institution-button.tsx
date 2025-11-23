import { Text, Autocomplete, Button, Flex, Modal } from "@mantine/core";
import type { BankConnection } from "@ynab-plus/domain";
import { useState } from "react";
import { getOptionRenderer } from "./get-option-renderer.tsx";

interface SelectInstitutionButtonProps {
  institutions: BankConnection[];
}

export const SelectInstitutionButton = ({
  institutions,
}: SelectInstitutionButtonProps) => {
  const [modalOpened, setModalOpened] = useState(false);
  const [bank, setBank] = useState<string>();
  return (
    <>
      <Modal
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
        }}
        title="Select Bank"
      >
        <Autocomplete
          data={institutions.map((institution) => institution.bankName)}
          renderOption={getOptionRenderer(institutions)}
          onChange={setBank}
          value={bank ?? ""}
        />
        <Text mt="md">
          Click on the box above and enter the name of your bank, then press the
          connect button to be taken to your bank for authorization.
        </Text>
        <Button mt="md" disabled={!bank}>
          Connect
        </Button>
      </Modal>
      <Flex justify={"center"}>
        <Button
          onClick={() => {
            setModalOpened(true);
          }}
        >
          Select Bank
        </Button>
      </Flex>
    </>
  );
};
