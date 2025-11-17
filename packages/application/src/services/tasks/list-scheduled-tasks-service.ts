import type { IHandleContext, ITaskScheduler } from "@ports";
import type { ILogger } from "@ynab-plus/bootstrap";

import { AbstractApplicationService } from "@core";
import type { IRole, Permission, RegularTask } from "@ynab-plus/domain";

export class ListScheduledTasksService extends AbstractApplicationService<"ListScheduledTasksCommand"> {
  public override requiredPermissions: Permission[] = ["admin", "system"];

  public constructor(
    private taskScheduler: ITaskScheduler,
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
