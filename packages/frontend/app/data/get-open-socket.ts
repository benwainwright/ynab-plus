let socketCache: Promise<WebSocket> | undefined;

export const SOCKET_URL = `ws://localhost:3016`;

export const getOpenSocket = async () => {
  if (!socketCache) {
    const socket = new WebSocket(SOCKET_URL);

    const socketPromise = new Promise<WebSocket>((accept, reject) => {
      socket.addEventListener("open", () => { accept(socket); });
      socket.addEventListener("error", reject);
    });

    socketCache = socketPromise;
  }

  return socketCache;
};
