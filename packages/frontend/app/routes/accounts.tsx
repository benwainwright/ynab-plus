import { Loader, Page } from "@components";
import { useAccounts } from "@data";
import { Table } from "@mantine/core";

export const Transactions = () => {
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
                  <Table.Td>{account.name}</Table.Td>
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
