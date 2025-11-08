import { useEffect, useState } from "react";
import { useCommand } from "./use-command.ts";

export const useCurrentUser = (socket: WebSocket | undefined) => {
  const { send, result } = useCommand("GetCurrentUser", socket);
  const [currentUserLoaded, setCurrentUserLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      if (socket) {
        await send(undefined);
        setCurrentUserLoaded(true);
      }
    })();
  }, [socket]);

  return { currentUser: result, currentUserLoaded };
};
