import { SocketContext, useCommand, useEvents } from "@client/hooks";
import styles from "./header.module.css";
import { useContext } from "react";
import { useNavigate } from "react-router";

interface HeaderProps {
  title: string;
}
export const Header = ({ title }: HeaderProps) => {
  const { socket } = useContext(SocketContext);
  const { send } = useCommand("Logout", socket);
  const navigate = useNavigate();

  const logout = async () => {
    await send(undefined);
  };

  useEvents(socket, (events) => {
    if (events.key === "LogoutSuccess") {
      navigate("/login");
    }
  });

  return (
    <header className={styles.header}>
      <h1>{title}</h1>
      <button onClick={logout}>Logout</button>
    </header>
  );
};
