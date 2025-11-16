import { CurrentUserContext } from "@components";
import { type ReactNode, useContext } from "react";
import { Navigate } from "react-router";

import { canAccess } from "@utils";
import { routesList, type RouteSpec } from "@config";
import { Title } from "@mantine/core";

interface PageProps {
  routeName: keyof typeof routesList;
  children: ReactNode;
}

export const Page = ({ children, routeName }: PageProps) => {
  const { currentUser, initialLoadComplete } = useContext(CurrentUserContext);
  const routeConfig: RouteSpec = routesList[routeName];
  const loading = <div aria-busy></div>;
  const header = routeConfig.header ?? routeName;
  const capitalisedHeader = `${header.charAt(0).toLocaleUpperCase()}${header.slice(1)}`;
  if (
    !canAccess({
      user: currentUser,
      routeTags: routeConfig.permissionsRequired,
    })
  ) {
    return initialLoadComplete ? (
      <Navigate to={routeConfig.authFailRedirect} />
    ) : (
      loading
    );
  }

  return initialLoadComplete ? (
    <>
      <Title order={2} mb="lg">
        {capitalisedHeader}
      </Title>
      {children}
    </>
  ) : (
    loading
  );
};
