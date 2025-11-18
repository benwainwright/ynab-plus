import { AbstractApplicationService } from "@core";
import type { IHandleContext, ITaskScheduler } from "@ports";
import type { ILogger } from "@ynab-plus/bootstrap";
import type { IRole, Permission, User } from "@ynab-plus/domain";

export class UpdateScheduledTaskService extends AbstractApplicationService<"UpdateScheduledTaskCommand"> {
  public constructor(
    private taskScheduler: ITaskScheduler,
    logger: ILogger,
  ) {
    super(logger);
  }

  public override readonly commandName = "UpdateScheduledTaskCommand";

  public override requiredPermissions: Permission[] = ["system"];

  protected override async handle<TRole extends IRole = User>({
    command: { data },
  }: IHandleContext<"UpdateScheduledTaskCommand", TRole>): Promise<{
    success: boolean;
  }> {
    const existingTask = await this.taskScheduler.getTask(data.id);

    if (!existingTask) {
      return { success: false };
    }

    await this.taskScheduler.updateTask(data);

    return { success: true };
  }
}
