import { CurrentUserProvider, Footer, Header } from "@components";
import { Outlet } from "react-router";

const AppLayout = () => {
  return (
    <CurrentUserProvider>
      <Header title="YNAB Plus!" />
      <Outlet />
      <Footer />
    </CurrentUserProvider>
  );
};

export default AppLayout;
