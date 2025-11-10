import { Suspense } from "react";
import styles from "./app.module.css";
import { AppRoutes, Footer, Header } from "@client/components";

export const App = () => {
  return (
    <Suspense fallback={<div className={styles.wrapper} aria-busy="true" />}>
      <div className={styles.wrapper}>
        <Header title={"YNAB Plus!"} />
        <AppRoutes />
        <Footer />
      </div>
    </Suspense>
  );
};
