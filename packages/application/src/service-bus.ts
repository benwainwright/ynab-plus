import type { Commands, User } from "@ynab-plus/domain";

import { ServiceNotFoundError } from "@errors";

import type {
  IServiceBus,
  ISingleItemStore,
  ICommandMessage,
  IEventBus,
} from "@ports";

import type { AbstractApplicationService } from "@services";

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
