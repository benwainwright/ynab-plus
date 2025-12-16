import type { EventEmitter } from "node:events";

import type { IEventBus, IEventPacket, IListener } from "@ynab-plus/app";
import { v7 } from "uuid";
import { injectable, unmanaged } from "inversify";
import { inject } from "@core";
import type { ILogger } from "@ynab-plus/bootstrap";

const LOG_CONTEXT = { context: "node-event-bus" };

@injectable()
export class NodeEventBus<TEvent> implements IEventBus<TEvent> {
  private listenerMap = new Map<string, IListener<TEvent>>();
  private children: IEventBus<TEvent>[] = [];
  public constructor(
    @inject("EventBusListener")
    private listener: EventEmitter,

    @inject("BusNamespace")
    private namespace: string,

    @inject("Logger")
    private logger: ILogger,

    @unmanaged()
    private parent?: IEventBus<TEvent>,
  ) {}

  public child(namespace: string): IEventBus<TEvent> {
    const child = new NodeEventBus<TEvent>(
      this.listener,
      `${this.namespace}-${namespace}`,
      this.logger,
      this,
    );

    this.children.push(child);
    return child;
  }

  public onAll(listener: IListener<TEvent>) {
    const listenerId = v7();

    this.listener.on(this.namespace, listener);
    this.listenerMap.set(listenerId, listener);
    return listenerId;
  }

  public off(identifier: string): void {
    const listenerToremove = this.listenerMap.get(identifier);
    if (listenerToremove) {
      this.listener.off(this.namespace, listenerToremove);
    }
  }

  public removeAll(): void {
    for (const [key] of this.listenerMap) {
      this.off(key);
    }
  }

  [Symbol.dispose](): void {
    this.removeAll();
  }

  public on<TKey extends keyof TEvent>(
    key: TKey,
    callback: (data: IEventPacket<TEvent, TKey>["data"]) => void,
  ): string {
    const handler: IListener<TEvent> = (packet) => {
      if (packet.key === key) {
        callback(packet.data);
      }
    };

    return this.onAll(handler);
  }

  public emit<TKey extends keyof TEvent>(key: TKey, data: TEvent[TKey]) {
    this.logger.info(`Event emitted: ${String(key)}`, LOG_CONTEXT);
    this.listener.emit(this.namespace, { key, data });
    this.parent?.emit(key, data);
  }
}
