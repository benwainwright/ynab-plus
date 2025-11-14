import { ServiceNotFoundError } from "@errors";
import type {
  ICommandMessage,
  IEventBus,
  IServiceBus,
  ISingleItemStore,
} from "@ports";
import type { AbstractApplicationService } from "@services";
import type { ILogger } from "@ynab-plus/bootstrap";
import type { Commands, User } from "@ynab-plus/domain";

import { LOG_CONTEXT } from "./services/abstract-application-service.ts";

export const LOGGER_CONTEXT = { context: "service-bus" };

export class ServiceBus implements IServiceBus {
  public constructor(
    private services: AbstractApplicationService<keyof Commands>[],
    private eventBus: IEventBus,
    private currentUserCache: ISingleItemStore<User>,
    private logger: ILogger,
  ) {
    this.services.forEach((service) => {
      this.logger.verbose(`${service.commandName} registered`, LOG_CONTEXT);
    });
  }

  public async handleCommand<TKey extends keyof Commands>(
    command: ICommandMessage,
  ): Promise<Commands[TKey]["response"]> {
    this.logger.debug(`Command receieved, locating service`, {
      ...LOG_CONTEXT,
      command,
    });

    const service = this.services.find((handler) => handler.canHandle(command));

    if (!service) {
      throw new ServiceNotFoundError(command);
    }

    this.logger.debug(`Found service`, {
      ...LOG_CONTEXT,
      service: service.commandName,
    });

    return await service.doHandle({
      command,
      eventBus: this.eventBus,
      currentUserCache: this.currentUserCache,
    });
  }
}
