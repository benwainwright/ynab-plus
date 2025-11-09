export interface IServerSocketClient {
  onOpen(socket: Bun.ServerWebSocket<unknown>): Promise<void>;

  onMessage(
    socket: Bun.ServerWebSocket<unknown>,
    message: string | Buffer<ArrayBuffer>,
  ): Promise<void>;
}
