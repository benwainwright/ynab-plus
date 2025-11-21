import type {
  IHandleContext,
  IOauthTokenRepository,
  ITaskScheduler,
} from "@ports";
import { AbstractApplicationService } from "@core";
import type { ILogger } from "@ynab-plus/bootstrap";
import { getTokenRefreshTaskKey } from "./get-token-refresh-task-key.ts";
import type { IRole } from "@ynab-plus/domain";

export class DisconnectOauthIntegrationService extends AbstractApplicationService<"DisconnectOauthIntegrationCommand"> {
  public constructor(
    private tokenRepo: IOauthTokenRepository,
    private taskScheduler: ITaskScheduler,
    logger: ILogger,
  ) {
    super(logger);
  }

  public override readonly commandName = "DisconnectOauthIntegrationCommand";

  public override requiredPermissions: ("public" | "user" | "admin")[] = [
    "user",
    "admin",
  ];

  protected override async handle<TRole extends IRole>({
    command: {
      data: { provider },
    },
    eventBus,
  }: IHandleContext<
    "DisconnectOauthIntegrationCommand",
    TRole
  >): Promise<undefined> {
    await this.tokenRepo.delete(this.currentUser.id, provider);

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
