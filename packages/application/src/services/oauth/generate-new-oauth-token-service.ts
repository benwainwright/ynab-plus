import type {
  IHandleContext,
  IOauthTokenRepository,
  ITaskScheduler,
  NewTokenRequesterFactory,
} from "@ports";
import type { ILogger } from "@ynab-plus/bootstrap";
import { RegularTask, type IRole, type Permission } from "@ynab-plus/domain";

import { AbstractApplicationServiceWithUserContext } from "@core";
import { getTokenRefreshTaskKey } from "./get-token-refresh-task-key.ts";

const LOG_CONTEXT = { context: "geenrate-new-oauth-token-service" };

export class GenerateNewOauthTokenService extends AbstractApplicationServiceWithUserContext<"GenerateNewOauthTokenCommand"> {
  public override readonly commandName = "GenerateNewOauthTokenCommand";

  public override requiredPermissions: Permission[] = ["user", "admin"];

  public constructor(
    private tokenRepository: IOauthTokenRepository,
    private newTokenRequesterFactory: NewTokenRequesterFactory,
    private taskScheduler: ITaskScheduler,
    logger: ILogger,
  ) {
    super(logger);
  }

  protected override async handle<TRole extends IRole>({
    command: {
      data: { code, provider },
    },
  }: IHandleContext<"GenerateNewOauthTokenCommand", TRole>): Promise<{
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

    this.logger.silly(`Exchanging token`, LOG_CONTEXT);

    const token = await requester.newToken(this.currentUser.id, code);

    this.logger.silly(`Token exchanged`, LOG_CONTEXT);

    await this.tokenRepository.save(token);

    const refreshTask = new RegularTask({
      name: "Refresh ynab Oauth token",
      description: "",
      id: getTokenRefreshTaskKey(this.currentUser.id, provider),
      minute: "0",
      onBehalfOf: "ben",
      command: "CheckOauthIntegrationStatusCommand",
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
