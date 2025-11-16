import { CurrentUserProvider, Header, NavBar } from "@components";
import { useDisclosure } from "@mantine/hooks";
import { AppShell, Container } from "@mantine/core";
import { Outlet } from "react-router";
import { useNotifications } from "@data";

const AppLayout = () => {
  const [opened, { toggle }] = useDisclosure();
  useNotifications();
  return (
    <CurrentUserProvider>
      <AppShell
        padding="md"
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: "sm",
          collapsed: { mobile: !opened },
        }}
      >
        <Header
          title="YNAB Plus!"
          onBurgerClick={toggle}
          sideBarOpened={opened}
        />
        <NavBar />

        <AppShell.Main>
          <Container>
            <Outlet />
          </Container>
        </AppShell.Main>
      </AppShell>
    </CurrentUserProvider>
  );
};

export default AppLayout;
