import type { IUser } from "@types";
import { createContext, useContext, type ReactNode } from "react";
import { SocketContext } from "./socket-provider.tsx";
import { useCurrentUser } from "./use-current-user.ts";

type CurrentUserContextProps = {
  user: IUser | undefined;
  finishedLoading: boolean;
};

export const CurrentUserContext = createContext<CurrentUserContextProps>({
  user: undefined,
  finishedLoading: false,
});

interface CurrentUserProviderProps {
  children: ReactNode;
}

export const CurrentUserProvider = ({ children }: CurrentUserProviderProps) => {
  const { socket } = useContext(SocketContext);
  const { currentUser, currentUserLoaded } = useCurrentUser(socket);
  return (
    <CurrentUserContext
      value={{ user: currentUser, finishedLoading: currentUserLoaded }}
    >
      {children}
    </CurrentUserContext>
  );
};
