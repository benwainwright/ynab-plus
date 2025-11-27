import { applicationServicesModule } from "@ynab-plus/app";

import {
  getContainer,
  bootstrapModule,
  BootstrapperToken,
} from "@ynab-plus/bootstrap";

export { integrationsModule } from "@ynab-plus/integration-adapters";
import { nodeAdaptersModule } from "@ynab-plus/node-adapters";
import { sqliteDataAdaptersModule } from "@ynab-plus/sqlite-adapters";
import { integrationsModule } from "@ynab-plus/integration-adapters";

import { serverModule } from "./server-module.ts";

const container = getContainer();

await container.load(
  bootstrapModule,
  nodeAdaptersModule,
  applicationServicesModule,
  sqliteDataAdaptersModule,
  integrationsModule,
  serverModule,
);

const bootstrapper = await container.getAsync(BootstrapperToken);

await bootstrapper.start();
