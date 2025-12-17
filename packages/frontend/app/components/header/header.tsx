import { AppShell, Burger, Group } from "@mantine/core";
import type { ReactNode } from "react";

interface HeaderProps {
  title: string;
  sideBarOpened: boolean;
  onBurgerClick: () => void;
}

export const Header = ({ title, sideBarOpened, onBurgerClick }: HeaderProps): ReactNode => {
  return (
    <AppShell.Header>
      <Group h="100%" px="md">
        <Burger opened={sideBarOpened} onClick={onBurgerClick} hiddenFrom="sm" size="sm" />
        {title}
      </Group>
    </AppShell.Header>
  );
};
