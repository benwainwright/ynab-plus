import { composeDataLayer } from "@infrastructure";
import { composeApplicationLayer } from "@application";
import { composeWebApp } from "@web-app";

export const run = () => {
  const dataLayer = composeDataLayer();
  const applicationLayer = composeApplicationLayer(dataLayer);
  const server = composeWebApp({ ...applicationLayer, developmentMode: true });

  server.start();
};
