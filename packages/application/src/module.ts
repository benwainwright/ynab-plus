import { Container, ContainerModule, type ResolutionContext } from "inversify";

import {
  EventBusToken,
  SessionStoreToken,
  type ISessionIdRequester,
} from "@ports";
import { ServiceBus, SessionStorage } from "@core";
import {
  ApplicationContainerToken,
  applicationModule,
} from "@ynab-plus/bootstrap";
import { RequestContainerFactoryToken } from "./ports/request-container-factory-token.ts";
import { ServiceBusToken } from "./ports/i-service-bus.ts";
import { loadServices } from "./services/load-services.ts";
import { attachDomainEventEmitter } from "./attach-domain-event-emitter.ts";

export const LOG_CONTEXT = { context: "app-services-module" };

export const applicationServicesModule = applicationModule(
  ({ load, logger }) => {
    logger.info(`Initialising application services module`, LOG_CONTEXT);
    load.bind(SessionStoreToken).to(SessionStorage).inRequestScope();
    load.bind(ServiceBusToken).to(ServiceBus).inRequestScope();
    loadServices(load);
    attachDomainEventEmitter(load);

    load
      .bind(RequestContainerFactoryToken)
      .toFactory((context: ResolutionContext) => {
        return () => async (sessionIdRequester: ISessionIdRequester) => {
          const container = context.get(ApplicationContainerToken);
          const parentEventBus = container.get(EventBusToken);

          const requestContainer = new Container({
            parent: container,
            defaultScope: "Request",
          });

          const requestScopedServicesModule = new ContainerModule(loadServices);
          await requestContainer.load(requestScopedServicesModule);

          const sessionId = await sessionIdRequester.getSessionId();

          requestContainer
            .bind(EventBusToken)
            .toConstantValue(parentEventBus.child(sessionId));

          return requestContainer;
        };
      });
    logger.debug(
      `Finished initialising application services module`,
      LOG_CONTEXT,
    );
  },
);
