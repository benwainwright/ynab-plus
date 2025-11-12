import { composeDataLayer } from "@infrastructure";
import { composeApplicationLayer } from "@ynab-plus/app";
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
