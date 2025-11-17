import { SocketEventBus } from "./socket-event-bus.ts";

import { WebSocketServer, type Server, WebSocket as WsWebsocket } from "ws";
import getPort from "get-port";
import { Account, deSerialiseObject, serialiseObject } from "@ynab-plus/domain";

let server: Server | undefined;
const port = await getPort();

beforeAll(async () => {
  server = new WebSocketServer({
    port,
  });

  await new Promise((accept) => {
    server?.on("listening", accept);
  });
});

const parseSocketMessage = (message: unknown) => {
  return message instanceof Buffer
    ? (JSON.parse(message.toString("utf-8")) as Record<string, unknown>)
    : typeof message === "string"
      ? (JSON.parse(message) as Record<string, unknown>)
      : message;
};

afterAll(() => {
  server?.close();
});

describe("the socket event bus", () => {
  it("listens to events emitted on the bus", async () => {
    const serverSocketPromise = new Promise<WsWebsocket>((accept) =>
      server?.once("connection", (ws) => {
        accept(ws);
      }),
    );
    const socket = new WebSocket(`ws://localhost:${String(port)}`);

    await new Promise((accept) => {
      socket.addEventListener("open", accept);
    });

    const bus = new SocketEventBus(socket);

    const accounts = [
      new Account({
        id: "one",
        userId: "ben",
        name: "hello",
        type: "checking",
        closed: false,
        note: "a note",
        deleted: false,
      }),

      new Account({
        id: "two",
        userId: "ben",
        name: "hello",
        type: "checking",
        closed: false,
        note: "a note",
        deleted: false,
      }),
    ];

    const listener = vi.fn();

    bus.on("AccountsSynced", listener);
    const serverSocket = await serverSocketPromise;

    serverSocket.send(
      JSON.stringify(
        serialiseObject({
          key: "AccountsSynced",
          data: accounts,
        }),
      ),
    );

    await vi.waitFor(() => {
      expect(listener).toHaveBeenCalledWith(accounts);
    });
  });

  it("allows you to emit events on the socket that get received", async () => {
    const serverMessagePromise = new Promise<WsWebsocket.RawData>((accept) =>
      server?.once("connection", (ws) => {
        ws.once("message", (message) => {
          accept(message);
        });
      }),
    );

    const socket = new WebSocket(`ws://localhost:${String(port)}`);

    await new Promise((accept) => {
      socket.addEventListener("open", accept);
    });

    const bus = new SocketEventBus(socket);

    const accounts = [
      new Account({
        id: "one",
        userId: "ben",
        name: "hello",
        type: "checking",
        closed: false,
        note: "a note",
        deleted: false,
      }),

      new Account({
        id: "two",
        userId: "ben",
        name: "hello",
        type: "checking",
        closed: false,
        note: "a note",
        deleted: false,
      }),
    ];

    bus.emit("AccountsSynced", accounts);

    const result = deSerialiseObject(
      parseSocketMessage(await serverMessagePromise),
    );

    expect(result).toEqual({
      key: "AccountsSynced",
      data: accounts,
    });
  });
});
