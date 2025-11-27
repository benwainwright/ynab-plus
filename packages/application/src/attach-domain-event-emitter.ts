import { emitDomainEventsOnSave } from "@core";
import type {
  TypedContainer,
  TypedContainerModuleLoadOptions,
} from "@inversifyjs/strongly-typed";
import type { IApplicationDependencies } from "@ports/groups";

export const attachDomainEventEmitter = (
  options: TypedContainerModuleLoadOptions<IApplicationDependencies>,
  container: TypedContainer<IApplicationDependencies>,
) => {
  options.onActivation("UserRepository", (_context, repo) => {
    const eventBus = container.get("EventBus");
    return emitDomainEventsOnSave(repo, eventBus, "save");
  });

  options.onActivation("BankConnectionRepository", (_context, repo) => {
    const eventBus = container.get("EventBus");
    return emitDomainEventsOnSave(
      repo,
      eventBus,
      "deleteConnection",
      "saveConnection",
    );
  });

  options.onActivation("OauthTokenRepository", (_context, repo) => {
    const eventBus = container.get("EventBus");
    return emitDomainEventsOnSave(repo, eventBus, "save");
  });

  options.onActivation("TaskScheduler", (_context, repo) => {
    const eventBus = container.get("EventBus");
    return emitDomainEventsOnSave(
      repo,
      eventBus,
      "deleteTask",
      "updateTask",
      "scheduleTask",
    );
  });

  options.onActivation("AccountRepository", (_context, repo) => {
    const eventBus = container.get("EventBus");
    return emitDomainEventsOnSave(
      repo,
      eventBus,
      "deleteAccount",
      "saveAccount",
      "saveAccounts",
    );
  });

  options.onActivation("SyncDetailsRepository", (_context, repo) => {
    const eventBus = container.get("EventBus");
    return emitDomainEventsOnSave(repo, eventBus, "save", "delete");
  });
};
