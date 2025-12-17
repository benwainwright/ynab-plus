import { applicationServicesModule } from "@ynab-plus/app";

import { bootstrapModule, type BootstrapTypes } from "@ynab-plus/bootstrap";

export { integrationsModule } from "@ynab-plus/integration-adapters";
import { nodeAdaptersModule } from "@ynab-plus/node-adapters";
import { sqliteDataAdaptersModule } from "@ynab-plus/sqlite-adapters";
import { integrationsModule } from "@ynab-plus/integration-adapters";

import { serverModule } from "@core";
import { TypedContainer } from "@inversifyjs/strongly-typed";

const start = async () => {
  const container = new TypedContainer<BootstrapTypes>({
    defaultScope: "Request"
  });

  container.bind("Container").toConstantValue(container);

  await container.load(bootstrapModule);
  await container.load(nodeAdaptersModule);
  await container.load(integrationsModule);
  await container.load(applicationServicesModule);
  await container.load(sqliteDataAdaptersModule);
  await container.load(serverModule);

  const bootstrapper = await container.getAsync("Bootstrapper");

  await bootstrapper.start();
};

start().catch((error: unknown) => {
  console.log(error);
});
