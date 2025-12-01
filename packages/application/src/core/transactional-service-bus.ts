import type { IServiceBus, IUnitOfWork } from "@ports";
import type { Commands, IRole, User, Command } from "@ynab-plus/domain";
import { injectable } from "inversify";
import { inject } from "./typed-inject.ts";

@injectable()
export class TransactionalServiceBus implements IServiceBus {
  public constructor(
    @inject("RootServiceBus")
    private rootBus: IServiceBus,

    @inject("UnitOfWork")
    private unitOfWork: IUnitOfWork,
  ) {}

  public async execute<
    TKey extends keyof Commands = keyof Commands,
    TRole extends IRole = User,
  >(command: Command<TKey, TRole>): Promise<Commands[TKey]["response"]> {
    try {
      await this.unitOfWork.begin();
      const result = await this.rootBus.execute(command);
      await this.unitOfWork.commit();
      return result;
    } catch (error) {
      await this.unitOfWork.rollback();
      throw error;
    }
  }
}
