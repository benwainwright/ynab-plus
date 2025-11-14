import { randomUUID } from "node:crypto";
import { EventEmitter } from "node:events";

import { describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";

import { EventBus } from "./event-bus.ts";
import type { IUUIDGenerator } from "./ports/i-uuid-generator.ts";

const mockUuidGenerator = mock<IUUIDGenerator>({
  getUUID: () => randomUUID(),
});

describe("event bus", () => {
  describe("on", () => {
    it("correctly subscribes to an event that can be listened to", async () => {
      const emitter = new EventEmitter();
      const bus = new EventBus(emitter, "foo", mockUuidGenerator);

      const data = {
        url: "foo",
        port: 20,
      };

      const result = new Promise((accept) =>
        bus.on("AppInitialised", (data) => accept(data)),
      );
      bus.emit("AppInitialised", data);

      expect(await result).toEqual(data);
    });

    it("does not listen to events with different keys", async () => {
      const emitter = new EventEmitter();
      const bus = new EventBus(emitter, "foo", mockUuidGenerator);

      const mockHandler = vi.fn();
      bus.on("AppInitialised", mockHandler);
      bus.emit("AppClosing", undefined);

      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe("off", () => {
    it("removes event handlers", () => {
      const emitter = new EventEmitter();
      const bus = new EventBus(emitter, "foo", mockUuidGenerator);

      const data = {
        url: "foo",
        port: 20,
      };

      const mockHandler = vi.fn();

      const identifier = bus.on("AppInitialised", mockHandler);
      bus.off(identifier);
      bus.emit("AppInitialised", data);

      expect(mockHandler).not.toHaveBeenCalled();
    });

    it("also removes onAllHandlers", () => {
      const emitter = new EventEmitter();
      const bus = new EventBus(emitter, "foo", mockUuidGenerator);

      const mockListener = vi.fn();

      const identifier = bus.onAll(mockListener);

      bus.off(identifier);

      bus.emit("AppClosing", undefined);

      expect(mockListener).not.toHaveBeenCalled();
    });
  });

  describe("removeAll", () => {
    it("removes all event handlers", () => {
      const emitter = new EventEmitter();

      const bus = new EventBus(emitter, "foo", mockUuidGenerator);

      const data = {
        url: "foo",
        port: 20,
      };

      const mockOne = vi.fn();
      const mockTwo = vi.fn();
      const mockThree = vi.fn();

      bus.on("AppClosing", mockOne);
      bus.on("AppInitialised", mockTwo);
      bus.onAll(mockThree);

      bus.removeAll();

      bus.emit("AppClosing", undefined);
      bus.emit("AppInitialised", data);

      expect(mockOne).not.toHaveBeenCalled();
      expect(mockTwo).not.toHaveBeenCalled();
      expect(mockThree).not.toHaveBeenCalled();
    });

    it("does not remove external listener", () => {
      const emitter = new EventEmitter();

      const mockExternalListener = vi.fn();
      emitter.on("foo", mockExternalListener);
      const bus = new EventBus(emitter, "foobar", mockUuidGenerator);

      bus.removeAll();
      emitter.emit("foo", "bar");

      expect(mockExternalListener).toHaveBeenCalled();
    });
  });

  describe("onAll", () => {
    it("listens to all events emitted on this bus", () => {
      const emitter = new EventEmitter();
      const bus = new EventBus(emitter, "foo", mockUuidGenerator);

      const mockListener = vi.fn();

      bus.onAll(mockListener);

      const data = {
        url: "foo",
        port: 20,
      };

      bus.emit("AppClosing", undefined);
      bus.emit("AppInitialised", data);

      expect(mockListener).toHaveBeenCalledWith({
        key: "AppClosing",
        data: undefined,
      });

      expect(mockListener).toHaveBeenCalledWith({
        key: "AppInitialised",
        data,
      });
    });
  });

  describe("Symbol.dispose", () => {
    it("removes all event handlers", () => {
      const emitter = new EventEmitter();
      {
        using bus = new EventBus(emitter, "foo", mockUuidGenerator);

        const mockOne = vi.fn();
        const mockTwo = vi.fn();

        bus.on("AppClosing", mockOne);
        bus.on("AppInitialised", mockTwo);
      }
      const mockListener = vi.fn();
      emitter.on("foo", mockListener);
      expect(mockListener).not.toHaveBeenCalled();
    });
  });

  describe("childbus", () => {
    it("receives events that are emitted by it", async () => {
      const emitter = new EventEmitter();
      const bus = new EventBus(emitter, "foo", mockUuidGenerator);

      const child = bus.child("foo-child");

      const data = {
        url: "foo",
        port: 20,
      };

      const result = new Promise((accept) =>
        child.on("AppInitialised", (data) => accept(data)),
      );

      child.emit("AppInitialised", data);

      expect(await result).toEqual(data);
    });

    it("also receives events that are emitted by the parent bus", async () => {
      const emitter = new EventEmitter();
      const bus = new EventBus(emitter, "foo", mockUuidGenerator);

      const child = bus.child("foo-child");

      const data = {
        url: "foo",
        port: 20,
      };

      const result = new Promise((accept) =>
        child.on("AppInitialised", (data) => accept(data)),
      );

      bus.emit("AppInitialised", data);

      expect(await result).toEqual(data);
    });

    it("does not receive events emitted by other children", () => {
      const emitter = new EventEmitter();
      const bus = new EventBus(emitter, "foo", mockUuidGenerator);

      const child1 = bus.child("foo-child");
      const child2 = bus.child("bar-child");

      const data = {
        url: "foo",
        port: 20,
      };

      const mockListener2 = vi.fn();
      const mockListener1 = vi.fn();

      child2.on("AppInitialised", mockListener2);
      child1.on("AppInitialised", mockListener1);
      child2.emit("AppInitialised", data);

      expect(mockListener2).toHaveBeenCalledWith(data);
      expect(mockListener1).not.toHaveBeenCalled();
    });

    it("does not emit events on the parent bus", () => {
      const emitter = new EventEmitter();
      const bus = new EventBus(emitter, "foo", mockUuidGenerator);

      const child1 = bus.child("foo-child");

      const data = {
        url: "foo",
        port: 20,
      };

      const mockListener1 = vi.fn();

      child1.emit("AppInitialised", data);
      bus.on("AppInitialised", mockListener1);

      expect(mockListener1).not.toHaveBeenCalled();
    });
  });
});
