import { AppServer } from "@websocket-server";
import { ContainerModule } from "inversify";
import {
  WebsocketServerHostConfigValueToken,
  WebsocketServerPortConfigValueToken,
} from "./websocket-server/app-server.ts";
import { BootstrapperToken } from "@ynab-plus/bootstrap";

import z from "zod";

import { ServerWebsocketClient } from "./websocket-server/websocket-client.ts";
import { TaskScheduler } from "@task-scheduler";

export const serverModule = new ContainerModule((load) => {
  load.bind(AppServer).toSelf();
  load.bind(ServerWebsocketClient).toSelf();
  load.bind(TaskScheduler).toSelf();

  load.onActivation(BootstrapperToken, (_context, bootstrapper) => {
    load
      .bind(WebsocketServerHostConfigValueToken)
      .toConstantValue(bootstrapper.configValue("websocketHost", z.string()));

    load
      .bind(WebsocketServerPortConfigValueToken)
      .toConstantValue(bootstrapper.configValue("websocketPort", z.number()));

    return bootstrapper;
  });
});
