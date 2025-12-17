import type { IDomainEventStore, IServiceBus, IUnitOfWork } from "@ports";
import type { Commands, IRole, User, Command } from "@ynab-plus/domain";
import { injectable } from "inversify";
import { inject } from "./typed-inject.ts";
import type { ILogger } from "@ynab-plus/bootstrap";

const LOG_CONTEXT = { context: "transactional-service-bus" };

@injectable()
export class TransactionalServiceBus implements IServiceBus {
  public constructor(
    @inject("RootServiceBus")
    private rootBus: IServiceBus,

    @inject("UnitOfWork")
    private unitOfWork: IUnitOfWork,

    @inject("DomainEventEmitter")
    private domainEvents: IDomainEventStore,

    @inject("Logger")
    private logger: ILogger
  ) {}

  public async execute<TKey extends keyof Commands = keyof Commands, TRole extends IRole = User>(
    command: Command<TKey, TRole>
  ): Promise<Commands[TKey]["response"]> {
    try {
      this.logger.silly(`Transactional service bus beginning execution`, LOG_CONTEXT);

      await this.unitOfWork.begin();

      const result = await this.rootBus.execute(command);

      this.logger.silly(`Execution successful - committing unit of work`, LOG_CONTEXT);
      await this.unitOfWork.commit();
      this.domainEvents.flush();
      return result;
    } catch (error) {
      this.logger.debug(`Execution failed - rolling back unit of work`, LOG_CONTEXT);
      await this.unitOfWork.rollback();
      this.domainEvents.purge();
      throw error;
    }
  }
}
