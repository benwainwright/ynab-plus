import { emitDomainEventsOnSave } from "@core";
import {
  AccountRepositoryToken,
  BankConnectionRepositoryToken,
  EventBusToken,
  OauthTokenRepositoryToken,
  SyncDetailsRepositoryToken,
  TaskSchedulerToken,
  UserRepositoryToken,
} from "@ports";
import type { ContainerModuleLoadOptions } from "inversify";

export const attachDomainEventEmitter = (
  options: ContainerModuleLoadOptions,
) => {
  options.onActivation(UserRepositoryToken, (context, repo) => {
    const eventBus = context.get(EventBusToken);
    return emitDomainEventsOnSave(repo, eventBus, "save");
  });

  options.onActivation(BankConnectionRepositoryToken, (context, repo) => {
    const eventBus = context.get(EventBusToken);
    return emitDomainEventsOnSave(
      repo,
      eventBus,
      "deleteConnection",
      "saveConnection",
    );
  });

  options.onActivation(OauthTokenRepositoryToken, (context, repo) => {
    const eventBus = context.get(EventBusToken);
    return emitDomainEventsOnSave(repo, eventBus, "save");
  });

  options.onActivation(TaskSchedulerToken, (context, repo) => {
    const eventBus = context.get(EventBusToken);
    return emitDomainEventsOnSave(
      repo,
      eventBus,
      "deleteTask",
      "updateTask",
      "scheduleTask",
    );
  });

  options.onActivation(AccountRepositoryToken, (context, repo) => {
    const eventBus = context.get(EventBusToken);
    return emitDomainEventsOnSave(
      repo,
      eventBus,
      "deleteAccount",
      "saveAccount",
      "saveAccounts",
    );
  });

  options.onActivation(SyncDetailsRepositoryToken, (context, repo) => {
    const eventBus = context.get(EventBusToken);
    return emitDomainEventsOnSave(repo, eventBus, "save", "delete");
  });
};
