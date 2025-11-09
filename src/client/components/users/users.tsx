import { SocketContext, useCommand } from "@client/hooks";
import { useContext, useEffect } from "react";

export const Users = () => {
  const { socket } = useContext(SocketContext);
  const { send, result } = useCommand("ListUsersCommand", socket);

  useEffect(() => {
    (async () => {
      await send({ limit: 30, offset: 0 });
    })();
  }, []);

  return (
    <section>
      <h2>Users</h2>
      {result && (
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Permissions</th>
            </tr>
          </thead>
          <tbody>
            {result.map((user) => (
              <tr>
                <td>{user.id}</td>
                <td>{user.email}</td>
                <td>{user.permissions.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};
