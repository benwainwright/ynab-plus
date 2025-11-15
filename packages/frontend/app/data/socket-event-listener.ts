import type { IEventListener, IEventPacket, IListener } from "@ynab-plus/app";
import type { Events } from "@ynab-plus/domain";
import { v7 } from "uuid";

export class SocketEventListener implements IEventListener<Events> {
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

    const listener = (packet: MessageEvent<Events>) => {
      if (packet.type === "message" && typeof packet.data === "string") {
        const parsed = JSON.parse(packet.data) as IEventPacket;
        callback(parsed);
      }
    };

    this.listenerMap.set(listenerId, listener);
    this.socket.addEventListener("message", listener);
    return listenerId;
  }

  public on<TKey extends keyof Events>(
    key: TKey,
    callback: (data: IEventPacket<Events, TKey>["data"]) => void,
  ): string {
    const handler = (packet: IEventPacket) => {
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
