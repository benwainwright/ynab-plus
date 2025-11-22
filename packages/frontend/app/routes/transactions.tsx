import { Loader, Page } from "@components";
import { useTransactions } from "@data";
import { Pagination, Table } from "@mantine/core";
import { DateTime } from "luxon";
import { useState } from "react";
import { useParams } from "react-router";

const dateFormat = {
  weekday: "short",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
} as const;

export const Transactions = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const [page, setPage] = useState(0);
  const { isPending, transactions, count } = useTransactions(
    page * 30,
    30,
    accountId,
  );
  return (
    <Page routeName="transactions">
      <Loader isPending={isPending} data={transactions}>
        {(data) => (
          <>
            <Table>
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
              total={count ?? 0}
            />
          </>
        )}
      </Loader>
    </Page>
  );
};

export default Transactions;
