import { use, useEffect, useState } from "react";
import { SocketEventListener } from "./socket-event-listener.ts";
import type { IListener } from "@ynab-plus/app";
import { getOpenSocket } from "./get-open-socket.ts";
import { useSocket } from "./use-socket.ts";

export const useEvents =
  typeof window !== "undefined"
    ? (callback: IListener) => {
        const socket = useSocket();

        const [listener, setSocketEventListener] =
          useState<SocketEventListener>();

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
        }, []);
      }
    : () => {};
