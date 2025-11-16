import type { IHandleContext, ITaskScheduler } from "@ports";
import type { ILogger } from "@ynab-plus/bootstrap";
import type { IRegularTask } from "@ynab-plus/domain";

import { AbstractApplicationService } from "@core";

export class ListScheduledTasksService extends AbstractApplicationService<"ListScheduledTasksCommand"> {
  public override requiredPermissions: ("public" | "user" | "admin")[] = [
    "admin",
  ];

  public constructor(
    private taskScheduler: ITaskScheduler,
    logger: ILogger,
  ) {
    super(logger);
  }

  public override readonly commandName = "ListScheduledTasksCommand";

  public override async handle({
    command,
  }: IHandleContext<"ListScheduledTasksCommand">): Promise<IRegularTask[]> {
    const { offset, limit } = command.data;

    return await this.taskScheduler.getTasks(offset, limit);
  }
}
