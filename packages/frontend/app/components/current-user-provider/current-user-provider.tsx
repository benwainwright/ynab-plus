import { useCurrentUser } from "@data";
import type { User } from "@ynab-plus/domain";
import { createContext, type ReactNode } from "react";

interface CurrentUserContextProps {
  currentUser: User | undefined;
  reloadUser: () => void;
}

export const CurrentUserContext = createContext<CurrentUserContextProps>({
  currentUser: undefined,
  reloadUser: () => {},
});

interface CurrentUserProviderProps {
  children: ReactNode;
}

export const CurrentUserProvider = ({ children }: CurrentUserProviderProps) => {
  const { currentUser, reloadUser } = useCurrentUser();
  return (
    <CurrentUserContext value={{ currentUser, reloadUser }}>
      {children}
    </CurrentUserContext>
  );
};
