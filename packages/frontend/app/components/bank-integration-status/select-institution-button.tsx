import { Autocomplete, Button, Flex, Modal } from "@mantine/core";
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
