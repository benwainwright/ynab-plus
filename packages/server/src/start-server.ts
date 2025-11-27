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
import type { TypedContainer } from "@inversifyjs/strongly-typed";

const container = getContainer();

await container.load(
  bootstrapModule,
  nodeAdaptersModule,
  applicationServicesModule,
  sqliteDataAdaptersModule,
  serverModule,
);

const containerAs = container as TypedContainer;

await containerAs.load(integrationsModule);

const bootstrapper = await container.getAsync(BootstrapperToken);

await bootstrapper.start();
