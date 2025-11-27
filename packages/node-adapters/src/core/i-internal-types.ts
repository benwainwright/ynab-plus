import type { ConfigValue } from "@ynab-plus/bootstrap";
import type EventEmitter from "node:events";

export interface IInternalTypes {
  EventBusListener: EventEmitter;
  BusNamespace: string;
  SessionPath: ConfigValue<string>;
}
