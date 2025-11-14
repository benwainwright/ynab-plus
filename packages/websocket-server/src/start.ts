import { composeApplicationLayer } from "@ynab-plus/app";
import { Bootstrapper, getWinstonLogger } from "@ynab-plus/bootstrap";
import { composeDataLayer } from "@ynab-plus/infrastructure";

import { composeWebApp } from "./compose.ts";

const logger = getWinstonLogger();

const LOG_CONTEXT = { context: "start" };

logger.info(`Starting composition`, LOG_CONTEXT);

const bootstrapper = new Bootstrapper({
  configFile: `ynab-plus.config.json`,
  logger,
});

const dataLayer = await composeDataLayer(bootstrapper, logger);

const applicationLayer = composeApplicationLayer(
  dataLayer,
  logger,
  bootstrapper,
);

await composeWebApp({
  ...applicationLayer,
  configurator: bootstrapper,
  logger,
});

logger.info(`Application composed`, LOG_CONTEXT);

await bootstrapper.start();
