import { Loader, ProtectedRoute } from "@components";
import { useUsers } from "@data";
import { Link } from "react-router";

export const Users = () => {
  const { users, isPending } = useUsers(0, 30);
  return (
    <ProtectedRoute routeName="users">
      <h2>Users</h2>
      <Loader isPending={isPending} data={users}>
        {(data) => (
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Permissions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((user) => (
                <tr key={`${user.id}-user-row`}>
                  <td>
                    <Link to={`/users/${user.id}/edit`}>{user.id}</Link>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.permissions.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Loader>
    </ProtectedRoute>
  );
};

export default Users;
