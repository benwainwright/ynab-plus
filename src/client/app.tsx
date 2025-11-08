import { useEffect } from "react";

import styles from "./app.module.css";
import { useSocket } from "./use-socket.ts";
import { useCommand } from "./use-command.ts";

export const App = () => {
  const { socket } = useSocket("ws://localhost:3015/socket");
  const { send, sending, result } = useCommand("RegisterCommand", socket);
  const { send: getCurrentUser, result: currentUserResult } = useCommand(
    "GetCurrentUser",
    socket,
  );
  useEffect(() => {
    (async () => {
      if (socket) {
        await getCurrentUser(undefined);
      }
    })();
  }, [socket]);

  return (
    <>
      <h1>Ynab Plus</h1>
      <table>
        <tbody>
          <tr>
            <td>Socket</td>
            <td>{socket ? "Connected" : "Disconnected"}</td>
          </tr>
          <tr>
            <td>CommandStatus</td>
            <td>{sending ? "Sending" : "Idle"}</td>
          </tr>
          <tr>
            <td>Command result</td>
            <td>{result ? JSON.stringify(result) : "N/A"}</td>
          </tr>
          <tr>
            <td>Current user</td>
            <td>
              {currentUserResult
                ? JSON.stringify(currentUserResult)
                : "Logged out"}
            </td>
          </tr>
        </tbody>
      </table>
      <p>{socket ? "Connected" : "Disconnected"}</p>
      <p>{sending ? "Sending" : "Idle"}</p>
      <p>{result ? JSON.stringify(result) : "N/A"}</p>
      <form
        className={styles.form}
        action={async (data) => {
          await send({
            username: data.get("username")?.toString() ?? "",
            email: data.get("email")?.toString() ?? "",
            password: data.get("password")?.toString() ?? "",
          });
        }}
      >
        <h2>Register</h2>
        <label htmlFor="username">Username</label>
        <input type="text" name="username" />
        <label htmlFor="password">Password</label>
        <input type="password" name="password" />
        <label htmlFor="email">Email</label>
        <input type="email" name="email" />
        <input type="submit" />
      </form>
    </>
  );
};
