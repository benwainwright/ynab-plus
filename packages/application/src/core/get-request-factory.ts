import { AbstractApplicationService, ServiceBus, SessionStorage } from "@core";
import type {
  IEventBus,
  IObjectStorage,
  ISessionIdRequester,
  ServiceBusFactory,
} from "@ports";
import type { ILogger } from "@ynab-plus/bootstrap";
import type { IUser } from "@ynab-plus/domain";

const LOG_CONTEXT = { context: "request-factory" };

interface IRequestFactoryConfig {
  logger: ILogger;
  sessionStorage: IObjectStorage<IUser & { $type: "user" }>;
  services: AbstractApplicationService[];
  eventBus: IEventBus;
}

export const getRequestFactory = ({
  logger,
  sessionStorage,
  services,
  eventBus,
}: IRequestFactoryConfig): ServiceBusFactory => {
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

    const sessionId = await sessionIdRequester.getSessionId();
    logger.silly(`Child bus created with session id ${sessionId}`, LOG_CONTEXT);

    const childBus = eventBus.child(await sessionIdRequester.getSessionId());
    return {
      serviceBus: new ServiceBus(services, childBus, currentUserCache, logger),
      eventBus: childBus,
    };
  };
};
