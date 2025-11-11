import { composeDataLayer } from "@infrastructure";
import { composeApplicationLayer } from "@application";
import { composeWebApp } from "@web-app";
import { Bootstrapper } from "@bootstrap";

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
