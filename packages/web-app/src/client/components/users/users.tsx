import { listUsers } from "@hooks";
import { use } from "react";
import { Link } from "react-router";

export const Users = () => {
  const users = use(listUsers(0, 30));

  return (
    <section>
      <h2>Users</h2>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Permissions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr>
              <td>
                <Link to={`/users/edit/${user.id}`}>{user.id}</Link>
              </td>
              <td>{user.email}</td>
              <td>{user.permissions.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};
