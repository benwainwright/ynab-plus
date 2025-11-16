import type {
  IHandleContext,
  IOauthTokenRepository,
  ITaskScheduler,
  IUUIDGenerator,
  NewTokenRequesterFactory,
} from "@ports";
import type { ILogger } from "@ynab-plus/bootstrap";
import { RegularTask, type Permission } from "@ynab-plus/domain";

import { AbstractApplicationService } from "./abstract-application-service.ts";

const LOG_CONTEXT = { context: "geenrate-new-oauth-token-service" };

export class GenerateNewOauthTokenService extends AbstractApplicationService<"GenerateNewOauthTokenCommand"> {
  public override readonly commandName = "GenerateNewOauthTokenCommand";

  public override requiredPermissions: Permission[] = ["user", "admin"];

  public constructor(
    private tokenRepository: IOauthTokenRepository,
    private newTokenRequesterFactory: NewTokenRequesterFactory,
    private uuidGenerator: IUUIDGenerator,
    private taskScheduler: ITaskScheduler,
    logger: ILogger,
  ) {
    super(logger);
  }

  protected override async handle({
    currentUserCache,
    command: {
      data: { code, provider },
    },
  }: IHandleContext<"GenerateNewOauthTokenCommand">): Promise<{
    status: "connected";
    expiry: Date;
    refreshed: Date | undefined;
    created: Date;
  }> {
    this.logger.silly(
      `Generating new oauth token for provider ${provider} with code ${code}`,
      LOG_CONTEXT,
    );

    const requester = this.newTokenRequesterFactory(provider);

    const currentUser = await currentUserCache.require();

    this.logger.silly(`Exchanging token`, LOG_CONTEXT);

    const token = await requester.newToken(currentUser.id, code);

    this.logger.silly(`Token exchanged`, LOG_CONTEXT);

    await this.tokenRepository.save(token);

    const refreshTask = new RegularTask({
      name: "Refresh ynab Oauth token",
      description: "",
      id: this.uuidGenerator.getUUID(),
      minute: "0",
      onBehalfOf: "ben",
      command: "SyncAccountsCommand",
      data: JSON.stringify({ provider }),
      hour: "*",
      day: "*",
      month: "*",
      weekDay: "*",
      created: new Date(),
      lastExecution: undefined,
    });

    await this.taskScheduler.scheduleTask(refreshTask);

    return {
      status: "connected",
      refreshed: token.refreshed,
      expiry: token.expiry,
      created: token.created,
    };
  }
}
