import { buildApplication, composeWebApp } from "@core";
import { Bootstrapper, getWinstonLogger } from "@ynab-plus/bootstrap";

const logger = getWinstonLogger();

const bootstrapper = new Bootstrapper({
  configFile: "ynab-plus.config.websocket-server.json",
  logger,
});

const application = buildApplication({
  logger,
  name: "Websocket Server",
  bootstrapper,
});

await composeWebApp({
  application,
  bootstrapper,
  logger,
});

await bootstrapper.start();
