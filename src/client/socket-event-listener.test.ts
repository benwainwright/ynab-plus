import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test";
import { mock as mockExtended } from "bun-mock-extended";
import { waitFor } from "@test-helpers";
import getPort from "get-port";
import { SocketEventListener } from "./socket-event-listener.ts";
import type { IEventPacket } from "@types";

let server: Bun.Server<undefined> | undefined;
let currentSocket: Bun.ServerWebSocket | undefined;

beforeAll(async () => {
  server = Bun.serve({
    port: await getPort(),
    fetch(req, server) {
      if (server.upgrade(req)) {
        return;
      }
      return new Response("Upgrade failed", { status: 500 });
    },
    websocket: {
      open: (socket) => {
        currentSocket = socket;
      },
      message: () => {},
    },
  });
});

afterAll(async () => {
  await server?.stop();
});

describe("socket-event-bus", () => {
  describe("onAll", () => {
    it("allows you to listen to events sent on the socket", async (done) => {
      const socket = new WebSocket(`ws://${server?.url.host}`);
      socket.addEventListener("open", async () => {
        const bus = new SocketEventListener(socket);

        const mockListener = mock();

        const data: IEventPacket<"AppInitialised"> = {
          key: "AppInitialised",
          data: {
            port: 2,
            url: "foo",
          },
        };

        bus.onAll(mockListener);
        currentSocket?.send(JSON.stringify(data));
        await waitFor(async () => {
          expect(mockListener).toHaveBeenCalled();
        });
        done();
      });
    });
  });
  describe("on", () => {
    it("allows you to listen to events sent on the socket", async (done) => {
      const socket = new WebSocket(`ws://${server?.url.host}`);
      socket.addEventListener("open", async () => {
        const bus = new SocketEventListener(socket);

        const mockListener = mock();

        const data: IEventPacket<"AppInitialised"> = {
          key: "AppInitialised",
          data: {
            port: 2,
            url: "foo",
          },
        };

        bus.on("AppInitialised", mockListener);
        currentSocket?.send(JSON.stringify(data));

        await waitFor(async () => {
          expect(mockListener).toHaveBeenCalled();
        });
        done();
      });
    });

    it("returns an identifier that can be used to clear the listener", async () => {
      const socket = mockExtended<WebSocket>();

      const bus = new SocketEventListener(socket);

      const mockListener = mock();

      const data: IEventPacket<"AppInitialised"> = {
        key: "AppInitialised",
        data: {
          port: 2,
          url: "foo",
        },
      };

      const identifier = bus.on("AppInitialised", mockListener);
      currentSocket?.send(JSON.stringify(data));
      bus.off(identifier);
      expect(socket.removeEventListener).toHaveBeenCalledWith(
        "message",
        expect.anything(),
      );
    });
  });

  describe("removeAll", () => {
    it("clears all the listeners", () => {
      const socket = mockExtended<WebSocket>();

      const bus = new SocketEventListener(socket);

      const mockListener = mock();
      const mockListener2 = mock();

      const data: IEventPacket<"AppInitialised"> = {
        key: "AppInitialised",
        data: {
          port: 2,
          url: "foo",
        },
      };

      bus.on("AppInitialised", mockListener);
      bus.on("AppClosing", mockListener2);

      currentSocket?.send(JSON.stringify(data));
      bus.removeAll();

      expect(socket.removeEventListener).toHaveBeenCalledTimes(2);
    });
  });

  describe("symbol dispose", () => {
    it("clears all the listeners", () => {
      const socket = mockExtended<WebSocket>();

      {
        using bus = new SocketEventListener(socket);

        const mockListener = mock();
        const mockListener2 = mock();

        const data: IEventPacket<"AppInitialised"> = {
          key: "AppInitialised",
          data: {
            port: 2,
            url: "foo",
          },
        };

        bus.on("AppInitialised", mockListener);
        bus.on("AppClosing", mockListener2);

        currentSocket?.send(JSON.stringify(data));
      }

      expect(socket.removeEventListener).toHaveBeenCalledTimes(2);
    });
  });
});
