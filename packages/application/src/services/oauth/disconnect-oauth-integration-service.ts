import { type IHandleContext, type IOauthTokenRepository, type ITaskScheduler } from "@ports";
import { inject, AbstractApplicationService } from "@core";
import { type ILogger } from "@ynab-plus/bootstrap";
import { getTokenRefreshTaskKey } from "./get-token-refresh-task-key.ts";
import type { IRole } from "@ynab-plus/domain";
import { injectable } from "inversify";

@injectable()
export class DisconnectOauthIntegrationService extends AbstractApplicationService<"DisconnectOauthIntegrationCommand"> {
  public constructor(
    @inject("OauthTokenRepository")
    private tokenRepo: IOauthTokenRepository,

    @inject("TaskScheduler")
    private taskScheduler: ITaskScheduler,

    @inject("Logger")
    logger: ILogger,
  ) {
    super(logger);
  }

  public override readonly commandName = "DisconnectOauthIntegrationCommand";

  public override requiredPermissions: ("public" | "user" | "admin")[] = ["user", "admin"];

  protected override async handle<TRole extends IRole>({
    command: {
      data: { provider },
    },
    eventBus,
  }: IHandleContext<"DisconnectOauthIntegrationCommand", TRole>): Promise<undefined> {
    const token = await this.tokenRepo.get(this.currentUser.id, provider);
    if (token) {
      await this.tokenRepo.delete(token);
    }

    const task = await this.taskScheduler.getTask(
      getTokenRefreshTaskKey(this.currentUser.id, provider),
    );

    if (task) {
      task.delete();
      await this.taskScheduler.deleteTask(task);
    }

    eventBus.emit("OauthIntegrationDisconnected", {
      provider,
    });
  }
}
