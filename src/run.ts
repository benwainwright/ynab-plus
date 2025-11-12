import { composeApplicationLayer } from "@ynab-plus/app";
import { composeDataLayer } from "@ynab-plus/infrastructure";
import { composeWebApp } from "@ynab-plus/web-app";
import { Bootstrapper } from "@ynab-plus/bootstrap";

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
