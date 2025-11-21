import { User } from "@ynab-plus/domain";

import {
  getRequestFactory,
  ServiceBus,
  type IInfrastructurePorts,
} from "@core";
import type { IApplicationLayer } from "./i-application-layer.ts";
import { getServices } from "@services";

const LOG_CONTEXT = { context: "compose-application-layer" };

export const composeApplicationLayer = ({
  taskScheduler,
  eventBus,
  userRepository,
  sessionStorage,
  accountsFetcher,
  accountsRepository,
  oauthTokenRepository,
  passwordHasher,
  passwordVerifier,
  oauthCheckerFactory,
  newTokenRequesterFactory,
  logger,
  bootstrapper,
  transactionFetcher,
  transactionRepository,
  syncdetailsRepository,
}: IInfrastructurePorts): IApplicationLayer => {
  logger.info(`Composing application layer`, LOG_CONTEXT);

  bootstrapper.addInitStep(async () => {
    logger.debug(`Creating initial admin user`, LOG_CONTEXT);

    const bootstrapAdmin = User.reconstitute({
      id: "admin",
      email: "no-reply@something.com",
      passwordHash: await passwordHasher.hash(`password`),
      permissions: ["user", "admin"],
    });

    await userRepository.save(bootstrapAdmin);
  });

  const withRequestScopedServiceBus = () => {
    const serviceBusFactory = getRequestFactory({
      transactionFetcher,
      transactionRepository,
      accountsFetcher,
      syncdetailsRepository,
      newTokenRequesterFactory,
      eventBus,
      oauthCheckerFactory,
      taskScheduler,
      oauthTokenRepository,
      accountsRepository,
      sessionStorage,
      userRepository,
      passwordHasher,
      passwordVerifier,
      logger,
    });
    return serviceBusFactory;
  };

  // eslint-disable-next-line @typescript-eslint/require-await
  const withSingletonServiceBus = async () => {
    const services = getServices({
      eventBus,
      userRepository,
      oauthCheckerFactory,
      syncdetailsRepository,
      oauthTokenRepository,
      taskScheduler,
      passwordHasher,
      passwordVerifier,
      transactionFetcher,
      transactionRepository,
      newTokenRequesterFactory,
      accountsRepository,
      accountsFetcher,
      logger,
    });
    const serviceBus = new ServiceBus(services, eventBus, logger);

    return { eventBus, serviceBus };
  };

  return { withRequestScopedServiceBus, withSingletonServiceBus };
};
