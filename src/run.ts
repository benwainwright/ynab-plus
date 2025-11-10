import { composeDataLayer } from "@infrastructure";
import { composeApplicationLayer } from "@application";
import { composeWebApp } from "@web-app";
import { JsonFileConfigReader } from "./configuration.ts";

export const run = async () => {
  const config = new JsonFileConfigReader(`ynab-plus.json`);

  const dataLayer = await composeDataLayer(config);

  const applicationLayer = composeApplicationLayer(dataLayer);

  const server = await composeWebApp({
    ...applicationLayer,
    configurator: config,
  });

  server.start();
};
