import { vi, type Mock } from "vitest";
import { mock as mockExtended } from "vitest-mock-extended";

type MessageListener = (event: MessageEvent) => void;
type EventListenerRef = EventListenerOrEventListenerObject;

type WithMocks<T> = {
  [K in keyof T]: T[K] extends (...args: infer TArgs) => infer TReturn
    ? Mock<TArgs, TReturn>
    : T[K];
};

export const createSocketHarness = () => {
  const socket = mockExtended<WithMocks<WebSocket>>({
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
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
