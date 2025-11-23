import { Button, Flex, Image, Modal, Paper, Stack } from "@mantine/core";
import type { BankConnection } from "@ynab-plus/domain";
import { useState } from "react";

interface SelectInstitutionButtonProps {
  institutions: BankConnection[];
}

export const SelectInstitutionButton = ({
  institutions,
}: SelectInstitutionButtonProps) => {
  const [modalOpened, setModalOpened] = useState(false);
  return (
    <>
      <Modal
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
        }}
        title="Select Bank"
      >
        <Stack>
          {institutions.map((institition) => (
            <Paper>
              <Flex dir="row">
                <Image radius="md" src={institition.logo} />
              </Flex>
            </Paper>
          ))}
        </Stack>
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
