import { SocketContext, useCurrentUser } from "@client/hooks";
import styles from "./app.module.css";
import { AppRoutes, Header, Footer } from "@client/components";
import { useContext } from "react";

export const App = () => {
  const { socket } = useContext(SocketContext);
  const user = useCurrentUser(socket);
  return (
    <div className={styles.wrapper}>
      <Header title={"YNAB Plus!"} />
      <AppRoutes currentUser={user} />
      <Footer />
    </div>
  );
};
