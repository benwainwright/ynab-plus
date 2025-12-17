import { CurrentUserContext } from "@components";
import { type ReactNode, useContext } from "react";
import { Navigate } from "react-router";

import { canAccess } from "@utils";
import { routesList } from "@config";
import { Box, Flex, Title } from "@mantine/core";

interface PageProps {
  routeName: keyof typeof routesList;
  children: ReactNode;
  headerActions?: ReactNode;
  title?: string;
}

export const Page = ({ children, routeName, title, headerActions }: PageProps): ReactNode => {
  const { currentUser, initialLoadComplete } = useContext(CurrentUserContext);
  const routeConfig = routesList[routeName];
  if (!routeConfig) {
    return null;
  }
  const loading = <div aria-busy></div>;
  const header = routeConfig.header ?? routeName;
  const capitalisedHeader = `${header.charAt(0).toLocaleUpperCase()}${header.slice(1)}`;
  if (
    !canAccess({
      user: currentUser,
      routeTags: routeConfig.permissionsRequired
    })
  ) {
    return initialLoadComplete ? <Navigate to={routeConfig.authFailRedirect} /> : loading;
  }

  return initialLoadComplete ? (
    <>
      <Title order={2} mb="xl" mt="l">
        <Flex gap="1rem" align="center">
          <Box style={{ flexGrow: 2 }}>{title ?? capitalisedHeader}</Box>
          {headerActions}
        </Flex>
      </Title>
      <Box mt="xl">{children}</Box>
    </>
  ) : (
    loading
  );
};
