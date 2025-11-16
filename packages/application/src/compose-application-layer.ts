import { getServices } from "@services";
import type { IBootstrapper, ILogger } from "@ynab-plus/bootstrap";
import { User } from "@ynab-plus/domain";

import { getRequestFactory, type IInfrastructurePorts } from "@core";

const LOG_CONTEXT = { context: "compose-application-layer" };

export const composeApplicationLayer = (
  {
    misc: { taskScheduler },
    messaging: { eventBus },
    data: {
      userRepository,
      sessionStorage,
      accountsFetcher,
      accountsRepository,
      oauthTokenRepository,
    },
    auth: { passwordHasher, passwordVerifier },
    oauth: { oauthCheckerFactory, newTokenRequesterFactory },
  }: IInfrastructurePorts,
  logger: ILogger,
  bootstrapper: IBootstrapper,
) => {
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

  const serviceBusFactory = getRequestFactory({
    eventBus,
    sessionStorage,
    services,
    logger,
  });

  return { serviceBusFactory };
};
