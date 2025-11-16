import { buildApplication } from "@core";
import { composeWebApp } from "@websocket-server";

const application = buildApplication({
  name: "Websocket Server",
  configFile: "ynab-plus.config.websocket-server.json",
});

await composeWebApp(application);

await application.start();
