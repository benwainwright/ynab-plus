import { Page, Loader } from "@components";
import { useTransactions } from "@data";
import {
  Loader as MantineLoader,
  Button,
  Pagination,
  Table,
} from "@mantine/core";
import { DateTime } from "luxon";
import { useParams } from "react-router";

const dateFormat = {
  weekday: "short",
  month: "short",
  day: "2-digit",
} as const;

export const Transactions = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const { isPending, transactions, page, setPage, totalPages, syncing, sync } =
    useTransactions(accountId);
  return (
    <Page
      routeName="transactions"
      headerActions={
        <Button variant="light" size="xs" onClick={() => void sync()}>
          {syncing ? <MantineLoader color="blue" size={15} /> : "Sync"}
        </Button>
      }
    >
      <Loader isPending={isPending} data={transactions}>
        {(data) => (
          <>
            <Table highlightOnHover tabularNums verticalSpacing={"sm"}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Payee</Table.Th>
                  <Table.Th>Amount</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {data.map((transaction) => (
                  <Table.Tr key={`${transaction.id}-account-row`}>
                    <Table.Td>
                      {DateTime.fromJSDate(
                        new Date(transaction.date),
                      ).toLocaleString(dateFormat)}
                    </Table.Td>
                    <Table.Td>{transaction.payee}</Table.Td>
                    <Table.Td>
                      {new Intl.NumberFormat("en-GB", {
                        style: "currency",
                        currency: "GBP",
                      }).format(transaction.amount / 1000)}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
            <Pagination
              mt={"lg"}
              value={page}
              onChange={setPage}
              total={totalPages}
            />
          </>
        )}
      </Loader>
    </Page>
  );
};

export default Transactions;
