import { Loader, Page } from "@components";
import { useUsers } from "@data";
import { Table } from "@mantine/core";
import { Link } from "react-router";

export const Users = () => {
  const { users, isPending } = useUsers(0, 30);
  return (
    <Page routeName="users">
      <Loader isPending={isPending} data={users}>
        {(data) => (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Username</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Permissions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <tbody>
              {data.map((user) => (
                <Table.Tr key={`${user.id}-user-row`}>
                  <Table.Td>
                    <Link to={`/users/${user.id}/edit`}>{user.id}</Link>
                  </Table.Td>
                  <Table.Td>{user.email}</Table.Td>
                  <Table.Td>{user.permissions.join(", ")}</Table.Td>
                </Table.Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Loader>
    </Page>
  );
};

export default Users;
