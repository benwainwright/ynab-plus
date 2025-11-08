import { createContext, type ReactNode } from "react";
import { useSocket } from "./use-socket.ts";

type SocketContextProps = {
  socket: WebSocket | undefined;
};

export const SocketContext = createContext<SocketContextProps>({
  socket: undefined,
});

interface SocketProviderProps {
  url: string;
  children: ReactNode;
}

export const SocketProvider = ({ url, children }: SocketProviderProps) => {
  const { socket } = useSocket(url);
  return <SocketContext value={{ socket }}>{children}</SocketContext>;
};
