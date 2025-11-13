import { composeApplicationLayer } from "@ynab-plus/app";
import { Bootstrapper, getWinstonLogger } from "@ynab-plus/bootstrap";
import { composeDataLayer } from "@ynab-plus/infrastructure";

import { composeWebApp } from "./backend/compose.ts";

const logger = getWinstonLogger();

const bootstrapper = new Bootstrapper({
  configFile: `ynab-plus.config.json`,
  logger,
});

const dataLayer = await composeDataLayer(bootstrapper, logger);

const applicationLayer = composeApplicationLayer(dataLayer, logger);

await composeWebApp({
  ...applicationLayer,
  configurator: bootstrapper,
  logger,
});

await bootstrapper.start();
