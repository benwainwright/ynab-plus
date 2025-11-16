import type {
  IHandleContext,
  IOauthTokenRepository,
  ITaskScheduler,
} from "@ports";
import { AbstractApplicationService } from "@core";
import type { ILogger } from "@ynab-plus/bootstrap";
import { getTokenRefreshTaskKey } from "./get-token-refresh-task-key.ts";

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

  protected override async handle({
    currentUserCache,
    command: {
      data: { provider },
    },
    eventBus,
  }: IHandleContext<"DisconnectOauthIntegrationCommand">): Promise<undefined> {
    const user = await currentUserCache.require();

    await this.tokenRepo.delete(user.id, provider);

    const task = await this.taskScheduler.getTask(
      getTokenRefreshTaskKey(user.id, provider),
    );

    if (task) {
      await this.taskScheduler.deleteTask(task);
    }

    eventBus.emit("OauthIntegrationDisconnected", {
      provider,
    });
  }
}
