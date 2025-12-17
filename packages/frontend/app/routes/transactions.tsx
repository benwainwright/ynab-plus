import { Page, Loader, Currency, BalanceCheckButton } from "@components";
import { useTransactions } from "@data";
import { Loader as MantineLoader, Button, Text, Pagination, Table } from "@mantine/core";
import { DateTime } from "luxon";
import { type ReactNode } from "react";
import { useParams } from "react-router";

const dateFormat = {
  weekday: "short",
  month: "short",
  day: "2-digit"
} as const;

export const Transactions = (): ReactNode => {
  const { accountId } = useParams<{ accountId: string }>();
  const { transactions, page, setPage, totalPages, syncing, sync, name } =
    useTransactions(accountId);

  return (
    <Page
      {...(name ? { title: name } : {})}
      routeName="transactions"
      headerActions={
        <>
          <Button variant="light" size="xs" onClick={() => void sync()}>
            {syncing ? <MantineLoader color="blue" size={15} /> : "Sync"}
          </Button>
          <BalanceCheckButton accountId={accountId} />
        </>
      }
    >
      <Loader data={transactions}>
        {(data) => (
          <>
            {data.length === 0 ? (
              <Text>No transactions</Text>
            ) : (
              <Table m="lg" highlightOnHover tabularNums verticalSpacing={"sm"} withColumnBorders>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th w={"15%"}>Date</Table.Th>
                    <Table.Th w={"70%"}>Payee</Table.Th>
                    <Table.Th>Amount</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {data.map((transaction) => (
                    <Table.Tr key={`${transaction.id}-account-row`}>
                      <Table.Td w="15%">
                        {DateTime.fromJSDate(new Date(transaction.date)).toLocaleString(dateFormat)}
                      </Table.Td>
                      <Table.Td w="70%">{transaction.payee}</Table.Td>
                      <Table.Td>
                        <Currency>{transaction.amount}</Currency>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
            <Pagination mt={"lg"} value={page} onChange={setPage} total={totalPages} />
          </>
        )}
      </Loader>
    </Page>
  );
};

export default Transactions;
