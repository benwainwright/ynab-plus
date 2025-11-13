import { useEffect, useState } from "react";
import { getOpenSocket } from "./get-open-socket.ts";

export const useSocket = () => {
  const [socket, setSocket] = useState<WebSocket>();

  useEffect(() => {
    (async () => {
      setSocket(await getOpenSocket());
    })();
  }, []);

  return socket;
};
