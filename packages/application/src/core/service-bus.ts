import { ServiceNotFoundError } from "@errors";
import { inspect } from "util";
import type { IEventBus, IServiceBus } from "@ports";
import type { AbstractApplicationService } from "@core";
import type { ILogger } from "@ynab-plus/bootstrap";
import type { Command, Commands, IRole, User } from "@ynab-plus/domain";

export const LOG_CONTEXT = { context: "service-bus" };

export class ServiceBus implements IServiceBus {
  public constructor(
    private services: AbstractApplicationService[],
    private eventBus: IEventBus,
    private logger: ILogger,
  ) {
    this.services.forEach((service) => {
      this.logger.verbose(`${service.commandName} registered`, LOG_CONTEXT);
    });
  }

  public async execute<
    TKey extends keyof Commands = keyof Commands,
    TRole extends IRole = User,
  >(command: Command<TKey, TRole>): Promise<Commands[TKey]["response"]> {
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

    const response = await service.doHandle({
      command,
      eventBus: this.eventBus,
    });

    this.logger.debug(
      `Service ${service.commandName} returned response, ${inspect(response)}`,
      {
        ...LOG_CONTEXT,
        service: service.commandName,
      },
    );

    return response;
  }
}
