import { CurrentUserProvider } from "@client/hooks";
import styles from "./app.module.css";
import { AppRoutes, Header, Footer } from "@client/components";

export const App = () => {
  return (
    <CurrentUserProvider>
      <div className={styles.wrapper}>
        <Header title={"YNAB Plus!"} />
        <AppRoutes />
        <Footer />
      </div>
    </CurrentUserProvider>
  );
};
