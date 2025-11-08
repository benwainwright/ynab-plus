import type { IEventListener, IEventPacket, IListener } from "@types";
import { v7 } from "uuid";

export class SocketEventListener implements IEventListener {
  private listenerMap = new Map<string, (packet: MessageEvent) => void>();

  public constructor(private socket: WebSocket) {}

  public off(identifier: string): void {
    const listenerToremove = this.listenerMap.get(identifier);
    if (listenerToremove) {
      this.socket.removeEventListener("message", listenerToremove);
    }
  }

  public onAll(callback: IListener): string {
    const listenerId = v7();

    const listener = (packet: MessageEvent) => {
      if (packet.type === "message" && typeof packet.data === "string") {
        const parsed = JSON.parse(packet.data);
        callback(parsed);
      }
    };
    this.listenerMap.set(listenerId, listener);
    this.socket.addEventListener("message", listener);
    return listenerId;
  }

  public on<TKey extends keyof Events>(
    key: TKey,
    callback: (data: Events[TKey]) => void,
  ): string {
    const handler = (packet: IEventPacket<keyof Events>) => {
      const hasKey = <K extends keyof Events>(
        p: IEventPacket<keyof Events>,
        key: K,
      ): p is IEventPacket<K> => {
        return p.key === key;
      };

      if (hasKey(packet, key)) {
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
