import type { User } from "@domain";

import { ServiceNotFoundError } from "./errors/service-not-found-error.ts";
import type { ISingleItemStore } from "./ports/i-single-item-store.ts";
import type { ICommandMessage, IEventBus } from "./ports/index.ts";

import type { IServiceBus } from "./ports/i-service-bus.ts";
import type { ApplicationService } from "./application-service.ts";

export class ServiceBus implements IServiceBus {
  public constructor(
    private services: ApplicationService<keyof Commands>[],
    private eventBus: IEventBus,
    private currentUserCache: ISingleItemStore<User | undefined>,
  ) {}

  public async handleCommand<TKey extends keyof Commands>(
    command: ICommandMessage<keyof Commands>,
  ): Promise<Commands[TKey]["response"]> {
    const service = this.services.find((handler) => handler.canHandle(command));

    if (!service) {
      throw new ServiceNotFoundError(command);
    }

    return await service.doHandle({
      command,
      eventBus: this.eventBus,
      currentUserCache: this.currentUserCache,
    });
  }
}
