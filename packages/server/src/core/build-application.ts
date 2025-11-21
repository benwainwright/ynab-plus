import { composeApplicationLayer } from "@ynab-plus/app";
import { type IBootstrapper, type ILogger } from "@ynab-plus/bootstrap";
import { compose as composeIntegrationAdapters } from "@ynab-plus/integration-adapters";
import { compose as composeNodeAdapters } from "@ynab-plus/node-adapters";
import { compose as composeSqliteAdapters } from "@ynab-plus/sqlite-adapters";

interface IApplicationInitialConfig {
  name: string;
  bootstrapper: IBootstrapper;
  logger: ILogger;
}

export const buildApplication = ({
  name,
  bootstrapper,
  logger,
}: IApplicationInitialConfig) => {
  const LOG_CONTEXT = { context: "start" };

  logger.info(`Initialising ${name}`, LOG_CONTEXT);

  const { eventBus, sessionStorage, hashValidator } = composeNodeAdapters(
    bootstrapper,
    logger,
  );

  const {
    tasksRepository,
    oauthTokenRepository,
    userRepository,
    accountsRepository,
    syncdetailsRepository,
    transactionRepository,
  } = composeSqliteAdapters(bootstrapper, logger);

  const { ynabClient, oauthClientFactory } = composeIntegrationAdapters(
    bootstrapper,
    logger,
  );

  const applicationLayer = composeApplicationLayer({
    transactionRepository,
    syncdetailsRepository,
    taskScheduler: tasksRepository,
    eventBus,
    passwordHasher: hashValidator,
    passwordVerifier: hashValidator,
    oauthCheckerFactory: oauthClientFactory,
    newTokenRequesterFactory: oauthClientFactory,
    accountsFetcher: ynabClient,
    transactionFetcher: ynabClient,
    sessionStorage,
    userRepository,
    accountsRepository,
    oauthTokenRepository,
    logger,
    bootstrapper,
  });

  return applicationLayer;
};
