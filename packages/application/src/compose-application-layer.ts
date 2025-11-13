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

import { EventBus } from "./event-bus.ts";
import type { IInfrastructurePorts } from "./i-data-ports.ts";
import { ServiceBus } from "./service-bus.ts";
import { SessionStorage } from "./session-storage.ts";
import type { ILogger } from "@ynab-plus/bootstrap";
import { child } from "winston";

const LOG_CONTEXT = { context: "compose-application-layer" };

export const composeApplicationLayer = (
  {
    data: { userRepository, sessionStorage },
    misc: { uuidGenerator },
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

  const events = new EventEmitter();

  const requestFactory: ServiceBusFactory = async ({
    sessionIdRequester,
  }: {
    sessionIdRequester: ISessionIdRequester;
  }) => {
    logger.silly(`Starting request factory`, LOG_CONTEXT);
    const eventBus = new EventBus(events, `ynab-plus`, uuidGenerator);
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
