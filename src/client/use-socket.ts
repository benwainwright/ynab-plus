import { useEffect, useState } from "react";

export const useSocket = (socketUrl: string) => {
  const [socket, setSocket] = useState<WebSocket | undefined>();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    setSocket(new WebSocket(socketUrl));
  }, [socketUrl]);

  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.addEventListener("open", () => {
      setConnected(true);
    });
  }, [socket]);

  return { socket: connected && socket ? socket : undefined };
};
