import { type ISessionIdRequester } from "@ports";
import { ServiceBus, SessionStorage } from "@core";
import { typedApplicationModule } from "@ynab-plus/bootstrap";
import { loadServices } from "./services/load-services.ts";
import { attachDomainEventEmitter } from "./attach-domain-event-emitter.ts";
import type { IApplicationDependencies } from "@ports/groups";
import {
  TypedContainer,
  TypedContainerModule,
} from "@inversifyjs/strongly-typed";

export const LOG_CONTEXT = { context: "app-services-module" };

export const applicationServicesModule =
  typedApplicationModule<IApplicationDependencies>(
    ({ load, logger, container }) => {
      logger.info(`Initialising application services module`, LOG_CONTEXT);

      load.bind("SessionStore").to(SessionStorage).inRequestScope();
      load.bind("ServiceBus").to(ServiceBus).inRequestScope();
      loadServices(load);
      attachDomainEventEmitter(load, container);

      load.bind("ContainerFactory").toFactory(() => {
        return async (sessionIdRequester: ISessionIdRequester) => {
          const parentEventBus = await container.getAsync("EventBus");

          const requestContainer = new TypedContainer<IApplicationDependencies>(
            {
              parent: container,
              defaultScope: "Request",
            },
          );

          const requestScopedServicesModule =
            new TypedContainerModule<IApplicationDependencies>(loadServices);

          await requestContainer.load(requestScopedServicesModule);

          const sessionId = await sessionIdRequester.getSessionId();

          requestContainer
            .bind("SessionIdRequester")
            .toConstantValue(sessionIdRequester);

          requestContainer
            .bind("EventBus")
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
