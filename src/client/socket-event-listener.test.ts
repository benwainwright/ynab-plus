import { describe, expect, it, mock } from "bun:test";
import { mock as mockExtended, mockFn } from "bun-mock-extended";
import { waitFor } from "@test-helpers";
import { SocketEventListener } from "./socket-event-listener.ts";
import type { IEventPacket } from "@types";

type MessageListener = (event: MessageEvent) => void;
type EventListenerRef = EventListenerOrEventListenerObject;

const createSocketHarness = () => {
  const socket = mockExtended<WebSocket>({
    addEventListener: mockFn(),
    removeEventListener: mockFn(),
  });

  const listeners = new Set<MessageListener>();
  const listenerMap = new Map<EventListenerRef, MessageListener>();

  const toMessageListener = (listener: EventListenerRef): MessageListener => {
    if (typeof listener === "function") {
      return listener as MessageListener;
    }

    return (event: MessageEvent) => {
      listener.handleEvent(event);
    };
  };

  socket.addEventListener.mockImplementation((type, listener) => {
    if (type !== "message") {
      return;
    }

    const messageListener = toMessageListener(listener);
    listenerMap.set(listener, messageListener);
    listeners.add(messageListener);
  });

  socket.removeEventListener.mockImplementation((type, listener) => {
    if (type !== "message") {
      return;
    }

    const messageListener = listenerMap.get(listener);

    if (!messageListener) {
      return;
    }

    listeners.delete(messageListener);
    listenerMap.delete(listener);
  });

  const send = (packet: unknown) => {
    const event = new MessageEvent("message", {
      data: JSON.stringify(packet),
    });

    for (const listener of listeners) {
      listener(event);
    }
  };

  return { socket, send };
};

describe("socket-event-bus", () => {
  describe("onAll", () => {
    it("allows you to listen to events sent on the socket", async () => {
      const { socket, send } = createSocketHarness();
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
      send(data);

      await waitFor(() => {
        expect(mockListener).toHaveBeenCalledWith(data);
      });

      bus[Symbol.dispose]();
    });
  });

  describe("on", () => {
    it("allows you to listen to events sent on the socket", async () => {
      const { socket, send } = createSocketHarness();
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
      send(data);

      await waitFor(() => {
        expect(mockListener).toHaveBeenCalledWith({
          port: 2,
          url: "foo",
        });
      });

      bus[Symbol.dispose]();
    });

    it("returns an identifier that can be used to clear the listener", () => {
      const { socket, send } = createSocketHarness();

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
      send(data);
      bus.off(identifier);
      expect(socket.removeEventListener).toHaveBeenCalledWith(
        "message",
        expect.anything(),
      );
    });
  });

  describe("removeAll", () => {
    it("clears all the listeners", () => {
      const { socket } = createSocketHarness();

      const bus = new SocketEventListener(socket);

      const mockListener = mock();
      const mockListener2 = mock();

      bus.on("AppInitialised", mockListener);
      bus.on("AppClosing", mockListener2);
      bus.removeAll();

      expect(socket.removeEventListener).toHaveBeenCalledTimes(2);
    });
  });

  describe("symbol dispose", () => {
    it("clears all the listeners", () => {
      const { socket } = createSocketHarness();

      {
        using bus = new SocketEventListener(socket);

        const mockListener = mock();
        const mockListener2 = mock();

        bus.on("AppInitialised", mockListener);
        bus.on("AppClosing", mockListener2);
      }

      expect(socket.removeEventListener).toHaveBeenCalledTimes(2);
    });
  });
});
