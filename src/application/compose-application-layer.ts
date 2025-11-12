import { EventEmitter } from "node:events";

import type { User } from "@domain";

import {
  CheckOauthIntegrationStatusService,
  GenerateNewOauthTokenService,
  GetCurrentUserService,
  GetUserService,
  ListUsersService,
  LoginService,
  LogoutService,
  RegisterUserService,
} from "@application/services";

import type { ISessionIdRequester } from "@application/ports";

import { EventBus } from "./event-bus.ts";
import type { IInfrastructurePorts } from "./i-data-ports.ts";
import { ServiceBus } from "./service-bus.ts";
import { SessionStorage } from "./session-storage.ts";

export const composeApplicationLayer = ({
  userRepository,
  passwordHasher,
  passwordVerifier,
  sessionStorage,
  uuidGenerator,
  oauthTokenRepository,
  oauthCheckerFactory,
  newTokenRequesterFactory,
}: IInfrastructurePorts) => {
  const services = [
    new GetCurrentUserService(userRepository),
    new GetUserService(userRepository),
    new ListUsersService(userRepository),
    new LoginService(userRepository, passwordVerifier),
    new LogoutService(),
    new RegisterUserService(userRepository, passwordHasher),

    new CheckOauthIntegrationStatusService(
      oauthTokenRepository,
      oauthCheckerFactory,
    ),

    new GenerateNewOauthTokenService(
      oauthTokenRepository,
      newTokenRequesterFactory,
    ),
  ];

  const events = new EventEmitter();
  const eventBus = new EventBus(events, `ynab-plus`, uuidGenerator);

  const serviceBusFactory = async ({
    sessionIdRequester,
  }: {
    sessionIdRequester: ISessionIdRequester;
  }) => {
    const currentUserCache = new SessionStorage<User | undefined>(
      sessionStorage,
      sessionIdRequester,
      uuidGenerator,
    );
    return new ServiceBus(
      services,
      eventBus.child(await currentUserCache.getSessionId()),
      currentUserCache,
    );
  };

  return { serviceBusFactory, eventBus };
};
