import { getCurrentUser } from "@data";
import type { User } from "@ynab-plus/domain";
import { createContext, RouterContextProvider } from "react-router";

export const CurrentUserContext = createContext<User | undefined>();

export const currentUser = async ({
  context,
}: {
  context: Readonly<RouterContextProvider>;
}) => {
  const user = await getCurrentUser();
  context.set(CurrentUserContext, user);
};
