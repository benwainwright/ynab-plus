import { AbstractApplicationService, ServiceBus, SessionStorage } from "@core";
import type {
  ICurrentUserSetter,
  IEventBus,
  IObjectStorage,
  IPasswordHasher,
  IPasswordVerifier,
  IRepository,
  ISessionIdRequester,
  RequestScopedServiceBusFactory,
} from "@ports";
import type { ILogger } from "@ynab-plus/bootstrap";
import type { IUser, User } from "@ynab-plus/domain";
import { getUserSettingServices } from "src/services/get-user-setting-services.ts";

const LOG_CONTEXT = { context: "request-factory" };

interface IRequestFactoryConfig {
  logger: ILogger;
  sessionStorage: IObjectStorage<IUser & { $type: "user" }>;
  services: AbstractApplicationService[];
  eventBus: IEventBus;
  userRepository: IRepository<User>;
  passwordVerifier: IPasswordVerifier;
  currentUserSetter?: ICurrentUserSetter;
  passwordHasher: IPasswordHasher;
}

export const getRequestFactory = ({
  logger,
  sessionStorage,
  services,
  userRepository,
  passwordHasher,
  passwordVerifier,
  eventBus,
}: IRequestFactoryConfig): RequestScopedServiceBusFactory => {
  return async ({
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

    const userSettingServices = getUserSettingServices({
      userRepository,
      logger,
      currentUserSetter: currentUserCache,
      passwordHasher,
      passwordVerifier,
    });

    const sessionId = await sessionIdRequester.getSessionId();
    logger.silly(`Child bus created with session id ${sessionId}`, LOG_CONTEXT);

    const childBus = eventBus.child(await sessionIdRequester.getSessionId());
    return {
      currentUser: await currentUserCache.get(),
      serviceBus: new ServiceBus(
        [...services, ...userSettingServices],
        childBus,
        logger,
      ),
      eventBus: childBus,
    };
  };
};
