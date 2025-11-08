import { SocketContext, useCurrentUser } from "@client/hooks";
import styles from "./app.module.css";
import { AppRoutes, Header, Footer } from "@client/components";
import { useContext } from "react";

export const App = () => {
  const { socket } = useContext(SocketContext);
  const { currentUser, currentUserLoaded } = useCurrentUser(socket);
  return (
    <div className={styles.wrapper}>
      <Header title={"YNAB Plus!"} />
      <AppRoutes
        currentUser={currentUser}
        currentUserLoaded={currentUserLoaded}
      />
      <Footer />
    </div>
  );
};
