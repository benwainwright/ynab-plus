import type { IHandleContext, IOauthTokenRepository } from "@ports";
import { AbstractApplicationService } from "./abstract-application-service.ts";
import type { ILogger } from "@ynab-plus/bootstrap";

export class DisconnectOauthIntegrationService extends AbstractApplicationService<"DisconnectOauthIntegrationCommand"> {
  public constructor(
    private tokenRepo: IOauthTokenRepository,
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

    eventBus.emit("OauthIntegrationDisconnected", {
      provider,
    });
  }
}
