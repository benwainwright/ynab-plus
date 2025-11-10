import { useEffect, useState } from "react";
import { SocketEventListener } from "./socket-event-listener.ts";
import type { IListener } from "@application";

export const useEvents = (
  socket: WebSocket | undefined,
  callback: IListener,
) => {
  const [listener, setSocketEventListener] = useState<SocketEventListener>();

  useEffect(() => {
    if (socket) {
      setSocketEventListener(new SocketEventListener(socket));
    }
  }, [socket]);

  useEffect(() => {
    if (listener) {
      listener.onAll(callback);
    }

    return () => listener?.removeAll();
  }, [listener]);
};
