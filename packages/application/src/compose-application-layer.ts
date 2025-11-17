import { getServices } from "@services";
import { User } from "@ynab-plus/domain";

import {
  getRequestFactory,
  ServiceBus,
  type IInfrastructurePorts,
} from "@core";
import type { IApplicationLayer } from "./i-application-layer.ts";

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
}: IInfrastructurePorts): IApplicationLayer => {
  logger.info(`Composing application layer`, LOG_CONTEXT);

  bootstrapper.addInitStep(async () => {
    logger.debug(`Creating initial admin user`, LOG_CONTEXT);

    const bootstrapAdmin = new User({
      id: "admin",
      email: "no-reply@something.com",
      passwordHash: await passwordHasher.hash(`password`),
      permissions: ["user", "admin"],
    });

    await userRepository.save(bootstrapAdmin);
  });

  const services = getServices({
    userRepository,
    oauthCheckerFactory,
    oauthTokenRepository,
    taskScheduler,
    passwordHasher,
    passwordVerifier,
    newTokenRequesterFactory,
    accountsRepository,
    accountsFetcher,
    logger,
  });

  const withRequestScopedServiceBus = () => {
    const serviceBusFactory = getRequestFactory({
      eventBus,
      sessionStorage,
      userRepository,
      passwordHasher,
      passwordVerifier,
      services,
      logger,
    });
    return serviceBusFactory;
  };

  // eslint-disable-next-line @typescript-eslint/require-await
  const withSingletonServiceBus = async () => {
    const serviceBus = new ServiceBus(services, eventBus, logger);

    return { eventBus, serviceBus };
  };

  return { withRequestScopedServiceBus, withSingletonServiceBus };
};
