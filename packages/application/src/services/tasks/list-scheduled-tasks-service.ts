import {
  TaskSchedulerToken,
  type IHandleContext,
  type ITaskScheduler,
} from "@ports";
import { LoggerToken, type ILogger } from "@ynab-plus/bootstrap";

import { AbstractApplicationService } from "@core";
import type { IRole, Permission, RegularTask } from "@ynab-plus/domain";
import { inject, injectable } from "inversify";

@injectable()
export class ListScheduledTasksService extends AbstractApplicationService<"ListScheduledTasksCommand"> {
  public override requiredPermissions: Permission[] = ["admin", "system"];

  public constructor(
    @inject(TaskSchedulerToken)
    private taskScheduler: ITaskScheduler,

    @inject(LoggerToken)
    logger: ILogger,
  ) {
    super(logger);
  }

  public override readonly commandName = "ListScheduledTasksCommand";

  public override async handle<TRole extends IRole>({
    command,
  }: IHandleContext<"ListScheduledTasksCommand", TRole>): Promise<
    RegularTask[]
  > {
    const { offset, limit } = command.data;

    return await this.taskScheduler.getTasks(offset, limit);
  }
}
