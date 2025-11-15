import { composeApplicationLayer } from "@ynab-plus/app";
import { Bootstrapper, getWinstonLogger } from "@ynab-plus/bootstrap";
import { compose as composeIntegrationAdapters } from "@ynab-plus/integration-adapters";
import { compose as composeNodeAdapters } from "@ynab-plus/node-adapters";
import { compose as composeSqliteAdapters } from "@ynab-plus/sqlite-adapters";

import { composeWebApp } from "./compose.ts";

const logger = getWinstonLogger();

const LOG_CONTEXT = { context: "start" };

logger.info(`Starting composition`, LOG_CONTEXT);

const bootstrapper = new Bootstrapper({
  configFile: `ynab-plus.config.json`,
  logger,
});

const { eventBus, sessionStorage, uuidGenerator, hashValidator } =
  composeNodeAdapters(bootstrapper, logger);

const { oauthTokenRepository, userRepository, accountsRepository } =
  composeSqliteAdapters(bootstrapper, logger);

const { ynabClient, oauthClientFactory } = composeIntegrationAdapters(
  bootstrapper,
  logger,
);

const applicationLayer = composeApplicationLayer(
  {
    misc: {
      uuidGenerator,
    },
    messaging: {
      eventBus,
    },
    auth: {
      passwordHasher: hashValidator,
      passwordVerifier: hashValidator,
    },
    oauth: {
      oauthCheckerFactory: oauthClientFactory,
      newTokenRequesterFactory: oauthClientFactory,
    },
    data: {
      accountsFetcher: ynabClient,
      sessionStorage,
      userRepository,
      accountsRepo: accountsRepository,
      oauthTokenRepository,
    },
  },
  logger,
  bootstrapper,
);

await composeWebApp({
  ...applicationLayer,
  configurator: bootstrapper,
  logger,
});

logger.info(`Application composed`, LOG_CONTEXT);

await bootstrapper.start();
