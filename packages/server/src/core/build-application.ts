import { composeApplicationLayer } from "@ynab-plus/app";
import { Bootstrapper, getWinstonLogger } from "@ynab-plus/bootstrap";
import { compose as composeIntegrationAdapters } from "@ynab-plus/integration-adapters";
import { compose as composeNodeAdapters } from "@ynab-plus/node-adapters";
import { compose as composeSqliteAdapters } from "@ynab-plus/sqlite-adapters";

interface IApplicationInitialConfig {
  name: string;
  configFile: string;
}

export const buildApplication = ({
  name,
  configFile,
}: IApplicationInitialConfig) => {
  const logger = getWinstonLogger();

  const LOG_CONTEXT = { context: "start" };

  logger.info(`Initialising ${name}`, LOG_CONTEXT);

  const bootstrapper = new Bootstrapper({
    configFile,
    logger,
  });

  const { eventBus, sessionStorage, uuidGenerator, hashValidator } =
    composeNodeAdapters(bootstrapper, logger);

  const {
    tasksRepository,
    oauthTokenRepository,
    userRepository,
    accountsRepository,
  } = composeSqliteAdapters(bootstrapper, logger);

  const { ynabClient, oauthClientFactory } = composeIntegrationAdapters(
    bootstrapper,
    logger,
  );

  const applicationLayer = composeApplicationLayer(
    {
      misc: {
        taskScheduler: tasksRepository,
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

  return {
    ...applicationLayer,
    configurator: bootstrapper,
    logger,
    start: async () => bootstrapper.start(),
  };
};
