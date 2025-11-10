import { composeDataLayer } from "./infrastructure/index.ts";
import { composeApplicationLayer } from "@application";
import { composeWebApp } from "./web-app/compose-web-app.ts";

export const run = () => {
  const dataLayer = composeDataLayer();
  const applicationLayer = composeApplicationLayer(dataLayer);
  const server = composeWebApp({ ...applicationLayer, developmentMode: true });

  server.start();
};
