import type { ISessionIdRequester, ServiceBusFactory } from "@ports";
import {
  CheckOauthIntegrationStatusService,
  GenerateNewOauthTokenService,
  GetCurrentUserService,
  GetUserService,
  ListAccountsService,
  ListUsersService,
  LoginService,
  LogoutService,
  RegisterUserService,
  SyncAccountsService,
} from "@services";
import type { IBootstrapper, ILogger } from "@ynab-plus/bootstrap";
import { User } from "@ynab-plus/domain";

import type { IInfrastructurePorts } from "./i-data-ports.ts";
import { ServiceBus } from "./service-bus.ts";
import { UpdateUserService } from "./services/update-user-service.ts";
import { SessionStorage } from "./session-storage.ts";

const LOG_CONTEXT = { context: "compose-application-layer" };

export const composeApplicationLayer = (
  {
    messaging: { eventBus },
    data: { userRepository, sessionStorage, accountsFetcher, accountsRepo },
    auth: { passwordHasher, passwordVerifier },
    oauth: {
      oauthTokenRepository,
      oauthCheckerFactory,
      newTokenRequesterFactory,
    },
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

  const services = [
    new GetCurrentUserService(userRepository, logger),
    new GetUserService(userRepository, logger),
    new ListUsersService(userRepository, logger),
    new LoginService(userRepository, passwordVerifier, logger),
    new LogoutService(logger),
    new RegisterUserService(userRepository, passwordHasher, logger),
    new UpdateUserService(userRepository, passwordHasher, logger),

    new CheckOauthIntegrationStatusService(
      oauthTokenRepository,
      oauthCheckerFactory,
      logger,
    ),

    new GenerateNewOauthTokenService(
      oauthTokenRepository,
      newTokenRequesterFactory,
      logger,
    ),
    new SyncAccountsService(
      oauthTokenRepository,
      accountsFetcher,
      accountsRepo,
      logger,
    ),
    new ListAccountsService(accountsRepo, logger),
  ];

  const requestFactory: ServiceBusFactory = async ({
    sessionIdRequester,
  }: {
    sessionIdRequester: ISessionIdRequester;
  }) => {
    logger.silly(`Starting request factory`, LOG_CONTEXT);

    const currentUserCache = new SessionStorage(
      sessionStorage,
      sessionIdRequester,
      logger,
    );

    const sessionId = await sessionIdRequester.getSessionId();
    logger.silly(`Child bus created with session id ${sessionId}`, LOG_CONTEXT);

    const childBus = eventBus.child(await sessionIdRequester.getSessionId());
    return {
      serviceBus: new ServiceBus(services, childBus, currentUserCache, logger),
      eventBus: childBus,
    };
  };

  return { serviceBusFactory: requestFactory };
};
