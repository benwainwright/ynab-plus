import { buildApplication } from "@core";
import { compose } from "@task-scheduler";
import { Bootstrapper, getWinstonLogger } from "@ynab-plus/bootstrap";

const logger = getWinstonLogger();

const bootstrapper = new Bootstrapper({
  configFile: "ynab-plus.config.task-scheduler.json",
  logger,
});

const application = buildApplication({
  logger,
  name: "Websocket Server",
  bootstrapper,
});

await compose({ logger, bootstrapper, application });

await bootstrapper.start();
