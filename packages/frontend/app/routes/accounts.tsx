import { Currency, Loader, Page } from "@components";
import { useAccounts } from "@data";
import { Button, Table, Loader as MantineLoader } from "@mantine/core";
import { Link } from "react-router";
import { type ReactNode } from "react";

export const Transactions = (): ReactNode => {
  const { isPending, accounts, sync, syncing } = useAccounts();
  return (
    <Page
      routeName="accounts"
      headerActions={
        <Button variant="light" size="xs" onClick={() => void sync()}>
          {syncing ? <MantineLoader color="blue" size={15} /> : "Sync"}
        </Button>
      }
    >
      <Loader isPending={isPending} data={accounts}>
        {(data) => (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Balance</Table.Th>
                <Table.Th>Type</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.map((account) => (
                <Table.Tr key={`${account.id}-account-row`}>
                  <Table.Td>
                    <Link to={`/accounts/${account.id}`}>{account.name}</Link>
                  </Table.Td>
                  <Table.Td>
                    <Currency>{account.clearedBalance}</Currency>
                  </Table.Td>
                  <Table.Td>{account.type}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Loader>
    </Page>
  );
};

export default Transactions;
