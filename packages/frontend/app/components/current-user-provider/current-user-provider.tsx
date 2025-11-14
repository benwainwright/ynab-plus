import { useCurrentUser } from "@data";
import type { User } from "@ynab-plus/domain";
import { createContext, type ReactNode } from "react";

interface CurrentUserContextProps {
  currentUser: User | undefined;
  reloadUser: () => void;
  initialLoadComplete: boolean;
}

export const CurrentUserContext = createContext<CurrentUserContextProps>({
  currentUser: undefined,
  initialLoadComplete: false,
  reloadUser: () => {},
});

interface CurrentUserProviderProps {
  children: ReactNode;
}

export const CurrentUserProvider = ({ children }: CurrentUserProviderProps) => {
  const { currentUser, reloadUser, initialLoadComplete } = useCurrentUser();
  return (
    <CurrentUserContext
      value={{ currentUser, reloadUser, initialLoadComplete }}
    >
      {children}
    </CurrentUserContext>
  );
};
