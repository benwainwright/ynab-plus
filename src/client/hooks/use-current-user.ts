import { useEffect, useState } from "react";
import { useCommand } from "./use-command.ts";
import type { IUser } from "@types";

export const useCurrentUser = (socket: WebSocket | undefined) => {
  const { send, result } = useCommand("GetCurrentUser", socket);
  const [currentUser, setCurrentUser] = useState<IUser>();

  useEffect(() => {
    (async () => {
      if (socket) {
        await send(undefined);
      }
    })();
  }, [socket]);

  useEffect(() => {
    if (result) {
      setCurrentUser(result);
    }
  }, [result]);

  return currentUser;
};
