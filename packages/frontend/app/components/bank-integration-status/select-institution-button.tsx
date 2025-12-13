import { Text, Autocomplete, Button, Flex, Modal } from "@mantine/core";
import type { BankConnection } from "@ynab-plus/domain";
import { useState, type ReactNode } from "react";
import { getOptionRenderer } from "./get-option-renderer.tsx";
import { command } from "@data";

interface SelectInstitutionButtonProps {
  institutions: BankConnection[];
}

export const SelectInstitutionButton = ({
  institutions,
}: SelectInstitutionButtonProps): ReactNode => {
  const [modalOpened, setModalOpened] = useState(false);
  const [bank, setBank] = useState<string>();

  const goToInstitutionLink = async () => {
    const institution = institutions.find(
      (institution) => institution.bankName === bank,
    );

    if (institution) {
      const result = await command(
        "GetInstitutionAuthorizationPageLinkCommand",
        institution,
      );
      window.location.href = result.url;
    }
  };

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
        <Button
          mt="md"
          disabled={!bank}
          onClick={() => {
            void goToInstitutionLink();
          }}
        >
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
