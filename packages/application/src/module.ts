import { type ISessionIdRequester } from "@ports";
import { DomainEventStore, ServiceBus, SessionStorage, TransactionalServiceBus } from "@core";
import { typedApplicationModule } from "@ynab-plus/bootstrap";
import { loadServices } from "./services/load-services.ts";
import type { IApplicationDependencies } from "@ports/groups";
import { TypedContainer, TypedContainerModule } from "@inversifyjs/strongly-typed";
import z from "zod";
import { User } from "@ynab-plus/domain";

export const LOG_CONTEXT = { context: "app-services-module" };

export const applicationServicesModule = typedApplicationModule<IApplicationDependencies>(
  ({ load, logger, container, bootstrapper }) => {
    logger.info(`Initialising application services module`, LOG_CONTEXT);

    const adminEmail = bootstrapper.configValue("adminEmail", z.string());
    const adminPassword = bootstrapper.configValue("adminPassword", z.string());

    bootstrapper.addInitStep(async () => {
      const userRepo = await container.getAsync("UserRepository");
      const passwordHasher = await container.getAsync("PasswordHasher");
      const bootstrapAdmin = User.reconstitute({
        id: "admin",
        email: await adminEmail.value,
        passwordHash: await passwordHasher.hash(await adminPassword.value),
        permissions: ["user", "admin"],
      });
      await userRepo.save(bootstrapAdmin);
    });

    load.bind("DomainEventBuffer").to(DomainEventStore).inSingletonScope();
    load.bind("DomainEventEmitter").toService("DomainEventBuffer");
    load.bind("RootServiceBus").to(ServiceBus).inRequestScope();
    load.bind("ServiceBus").to(TransactionalServiceBus).inRequestScope();

    loadServices(load);

    load.bind("ContainerFactory").toFactory(() => {
      return async (sessionIdRequester: ISessionIdRequester) => {
        const parentEventBus = await container.getAsync("EventBus");

        const requestContainer = new TypedContainer<IApplicationDependencies>({
          parent: container,
          defaultScope: "Request",
        });

        const requestScopedServicesModule = new TypedContainerModule<IApplicationDependencies>(
          loadServices,
        );

        requestContainer.bind("CurrentUserSetter").to(SessionStorage).inRequestScope();

        requestContainer.bind("SessionStore").to(SessionStorage).inRequestScope();

        requestContainer.bind("SessionIdRequester").toConstantValue(sessionIdRequester);

        const sessionId = await sessionIdRequester.getSessionId();

        requestContainer.bind("EventBus").toConstantValue(parentEventBus.child(sessionId));

        await requestContainer.load(requestScopedServicesModule);

        return requestContainer;
      };
    });
    logger.debug(`Finished initialising application services module`, LOG_CONTEXT);
  },
);
