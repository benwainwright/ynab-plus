import { EventEmitter } from "node:events";
import type { IInfrastructurePorts } from "./i-data-ports.ts";
import { ServiceBus } from "./service-bus.ts";
import { GetCurrentUserService } from "./services/get-current-user-service.ts";
import { GetUserService } from "./services/get-user-service.ts";
import { ListUsersService } from "./services/list-users-service.ts";
import { LoginService } from "./services/login-service.ts";
import { LogoutService } from "./services/logout-service.ts";
import { RegisterUserService } from "./services/register-user-service.ts";
import { EventBus } from "./event-bus.ts";
import type { ISessionIdRequester } from "./ports/index.ts";
import type { User } from "@domain";
import { SessionStorage } from "./session-storage.ts";

export const composeApplicationLayer = ({
  userRepository,
  passwordHasher,
  passwordVerifier,
  sessionStorage,
}: IInfrastructurePorts) => {
  const services = [
    new GetCurrentUserService(userRepository),
    new GetUserService(userRepository),
    new ListUsersService(userRepository),
    new LoginService(userRepository, passwordVerifier),
    new LogoutService(),
    new RegisterUserService(userRepository, passwordHasher),
  ];

  const events = new EventEmitter();
  const eventBus = new EventBus(events, `ynab-plus`);

  const serviceBusFactory = async ({
    sessionIdRequester,
  }: {
    sessionIdRequester: ISessionIdRequester;
  }) => {
    const currentUserCache = new SessionStorage<User | undefined>(
      sessionStorage,
      sessionIdRequester,
    );
    return new ServiceBus(
      services,
      eventBus.child(await currentUserCache.getSessionId()),
      currentUserCache,
    );
  };

  return { serviceBusFactory, eventBus };
};
