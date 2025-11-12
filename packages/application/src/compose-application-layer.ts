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

import type { ISessionIdRequester } from "@ports";

import { EventBus } from "./event-bus.ts";
import type { IInfrastructurePorts } from "./i-data-ports.ts";
import { ServiceBus } from "./service-bus.ts";
import { SessionStorage } from "./session-storage.ts";

export const composeApplicationLayer = ({
  data: { userRepository, sessionStorage },
  misc: { uuidGenerator },
  auth: { passwordHasher, passwordVerifier },
  oauth: {
    oauthTokenRepository,
    oauthCheckerFactory,
    newTokenRequesterFactory,
  },
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
