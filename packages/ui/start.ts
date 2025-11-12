import { composeApplicationLayer } from "@ynab-plus/app";
import { Bootstrapper } from "@ynab-plus/bootstrap";
import { composeDataLayer } from "@ynab-plus/infrastructure";

import { composeWebApp } from "./backend/compose.ts";

const bootstrapper = new Bootstrapper({
  configFile: `ynab-plus.config.json`,
});

const dataLayer = await composeDataLayer(bootstrapper);

const applicationLayer = composeApplicationLayer(dataLayer);

await composeWebApp({
  ...applicationLayer,
  configurator: bootstrapper,
});

await bootstrapper.start();
