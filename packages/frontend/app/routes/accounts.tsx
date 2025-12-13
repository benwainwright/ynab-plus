import { Loader, Page } from "@components";
import { useAccounts } from "@data";
import { Table } from "@mantine/core";
import { Link } from "react-router";
import { type ReactNode } from "react";

export const Transactions = (): ReactNode => {
  const { isPending, accounts } = useAccounts();
  return (
    <Page routeName="accounts">
      <Loader isPending={isPending} data={accounts}>
        {(data) => (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Type</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.map((account) => (
                <Table.Tr key={`${account.id}-account-row`}>
                  <Table.Td>
                    <Link to={`/accounts/${account.id}`}>{account.name}</Link>
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
