import { mock, type Mock } from "bun:test";
import { mock as mockExtended } from "bun-mock-extended";

type MessageListener = (event: MessageEvent) => void;
type EventListenerRef = EventListenerOrEventListenerObject;

type WithMocks<T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in keyof T]: T[K] extends (...args: any[]) => any ? Mock<T[K]> : T[K];
};

export const createSocketHarness = () => {
  const socket = mockExtended<WithMocks<WebSocket>>({
    addEventListener: mock(),
    removeEventListener: mock(),
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

  socket.addEventListener.mockImplementation(
    (type: string, listener: EventListenerRef) => {
      if (type !== "message") {
        return;
      }

      const messageListener = toMessageListener(listener);
      listenerMap.set(listener, messageListener);
      listeners.add(messageListener);
    },
  );

  socket.removeEventListener.mockImplementation(
    (type: string, listener: EventListenerRef) => {
      if (type !== "message") {
        return;
      }

      const messageListener = listenerMap.get(listener);

      if (!messageListener) {
        return;
      }

      listeners.delete(messageListener);
      listenerMap.delete(listener);
    },
  );

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
