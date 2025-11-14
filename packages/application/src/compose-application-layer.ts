import { EventEmitter } from "node:events";

import type { User } from "@ynab-plus/domain";

import {
  CheckOauthIntegrationStatusService,
  GenerateNewOauthTokenService,
  GetCurrentUserService,
  GetUserService,
  ListUsersService,
  LoginService,
  LogoutService,
  RegisterUserService,
} from "@services";

import type { ISessionIdRequester, ServiceBusFactory } from "@ports";

import type { IInfrastructurePorts } from "./i-data-ports.ts";
import { ServiceBus } from "./service-bus.ts";
import { SessionStorage } from "./session-storage.ts";
import type { ILogger } from "@ynab-plus/bootstrap";

const LOG_CONTEXT = { context: "compose-application-layer" };

export const composeApplicationLayer = (
  {
    messaging: { eventBus },
    data: { userRepository, sessionStorage },
    auth: { passwordHasher, passwordVerifier },
    oauth: {
      oauthTokenRepository,
      oauthCheckerFactory,
      newTokenRequesterFactory,
    },
  }: IInfrastructurePorts,
  logger: ILogger,
) => {
  logger.info(`Composing application layer`, LOG_CONTEXT);
  const services = [
    new GetCurrentUserService(userRepository, logger),
    new GetUserService(userRepository, logger),
    new ListUsersService(userRepository, logger),
    new LoginService(userRepository, passwordVerifier, logger),
    new LogoutService(logger),
    new RegisterUserService(userRepository, passwordHasher, logger),

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
  ];

  const requestFactory: ServiceBusFactory = async ({
    sessionIdRequester,
  }: {
    sessionIdRequester: ISessionIdRequester;
  }) => {
    logger.silly(`Starting request factory`, LOG_CONTEXT);
    const currentUserCache = new SessionStorage<User | undefined>(
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
