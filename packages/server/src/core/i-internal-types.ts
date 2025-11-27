import type { TaskScheduler } from "@task-scheduler";
import type { AppServer, ServerWebsocketClient } from "@websocket-server";
import type { ConfigValue } from "@ynab-plus/bootstrap";

export interface IInternalTypes {
  AppServer: AppServer;
  TaskRunner: TaskScheduler;
  ServerWebsocketClient: ServerWebsocketClient;
  WebsocketServerHost: ConfigValue<string>;
  WebsocketServerPort: ConfigValue<number>;
}
