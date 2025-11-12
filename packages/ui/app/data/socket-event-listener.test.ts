import { describe, expect, it, vi } from "vitest";
import { createSocketHarness, waitFor } from "@ynab-plus/test-helpers";
import { SocketEventListener } from "./socket-event-listener.ts";
import type { IEventPacket } from "@ynab-plus/app";

describe("socket-event-bus", () => {
  describe("onAll", () => {
    it("allows you to listen to events sent on the socket", async () => {
      const { socket, send } = createSocketHarness();
      const bus = new SocketEventListener(socket);

      const mockListener = vi.fn();

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

      const mockListener = vi.fn();

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

      const mockListener = vi.fn();

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

      const mockListener = vi.fn();
      const mockListener2 = vi.fn();

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

        const mockListener = vi.fn();
        const mockListener2 = vi.fn();

        bus.on("AppInitialised", mockListener);
        bus.on("AppClosing", mockListener2);
      }

      expect(socket.removeEventListener).toHaveBeenCalledTimes(2);
    });
  });
});
