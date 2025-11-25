import { AbstractApplicationService } from "@core";
import {
  TaskSchedulerToken,
  type IHandleContext,
  type ITaskScheduler,
} from "@ports";
import { LoggerToken, type ILogger } from "@ynab-plus/bootstrap";
import type { IRole, Permission, User } from "@ynab-plus/domain";
import { inject, injectable } from "inversify";

@injectable()
export class UpdateScheduledTaskService extends AbstractApplicationService<"UpdateScheduledTaskCommand"> {
  public constructor(
    @inject(TaskSchedulerToken)
    private taskScheduler: ITaskScheduler,

    @inject(LoggerToken)
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
