import { use, useEffect, useState } from "react";
import { SocketEventListener } from "./socket-event-listener.ts";
import type { IListener } from "@ynab-plus/app";
import { getOpenSocket } from "./get-open-socket.ts";

export const useEvents = (callback: IListener) => {
  if (typeof window === "undefined") {
    return;
  }
  const socket = use(getOpenSocket());
  const [listener, setSocketEventListener] = useState<SocketEventListener>();

  useEffect(() => {
    setSocketEventListener(new SocketEventListener(socket));
  }, []);

  useEffect(() => {
    if (listener) {
      listener.onAll(callback);
    }

    return () => listener?.removeAll();
  }, [listener]);
};
