import type {
  IEventEmitter,
  IEventPacket,
  IEventListener,
  IListener,
  AllEvents,
} from "@ynab-plus/app";
import { Serialiser } from "@ynab-plus/serialiser";
import { type Events } from "@ynab-plus/domain";
import { v7 } from "uuid";

type Bus = IEventEmitter<AllEvents> & IEventListener<AllEvents>;

export class SocketEventBus implements Bus {
  private listenerMap = new Map<string, (packet: MessageEvent) => void>();

  public constructor(private socket: WebSocket) {}

  emit<TKey extends keyof AllEvents>(key: TKey, data: AllEvents[TKey]): void {
    const serialiser = new Serialiser();
    this.socket.send(
      serialiser.serialise({
        key,
        data,
      }),
    );
  }

  public off(identifier: string): void {
    const listenerToremove = this.listenerMap.get(identifier);
    if (listenerToremove) {
      this.socket.removeEventListener("message", listenerToremove);
    }
  }

  public onAll(callback: IListener): string {
    const listenerId = v7();

    const listener = (packet: MessageEvent<Events>) => {
      if (packet.type === "message" && typeof packet.data === "string") {
        const serialiser = new Serialiser();
        const parsed = serialiser.deserialise(
          packet.data,
        ) as IEventPacket<AllEvents>;
        callback(parsed);
      }
    };

    this.listenerMap.set(listenerId, listener);
    this.socket.addEventListener("message", listener);
    return listenerId;
  }

  public on<TKey extends keyof AllEvents>(
    key: TKey,
    callback: (data: IEventPacket<AllEvents, TKey>["data"]) => void,
  ): string {
    const handler = (packet: IEventPacket<AllEvents>) => {
      if (packet.key === key) {
        callback(packet.data);
      }
    };

    return this.onAll(handler);
  }

  public removeAll(): void {
    for (const [key] of this.listenerMap) {
      this.off(key);
    }
  }

  [Symbol.dispose](): void {
    this.removeAll();
  }
}
