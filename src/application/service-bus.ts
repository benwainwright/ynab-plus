import type { User } from "@domain";

import { ServiceNotFoundError } from "@application/errors";

import type {
  IServiceBus,
  ISingleItemStore,
  ICommandMessage,
  IEventBus,
} from "@application/ports";

import type { AbstractApplicationService } from "@application/services";

export class ServiceBus implements IServiceBus {
  public constructor(
    private services: AbstractApplicationService<keyof Commands>[],
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
