import { type IHandleContext, type IOauthCheckerFactory } from "@ports";
import { type ILogger } from "@ynab-plus/bootstrap";
import type { IRole, Permission } from "@ynab-plus/domain";

export const LOG_CONTEXT = {
  context: "check-oauth-integration-status-service",
};

import { inject, AbstractApplicationService } from "@core";
import { injectable } from "inversify";
import type { OauthTokenManager } from "./oauth-token-manager.ts";
import { TokenWasNotFoundError } from "./no-token-found-error.ts";

@injectable()
export class CheckOauthIntegrationStatusService extends AbstractApplicationService<"CheckOauthIntegrationStatusCommand"> {
  public constructor(
    @inject("OauthManager")
    private tokenManager: OauthTokenManager,

    @inject("OauthCheckerFactory")
    private oauthClientFactory: IOauthCheckerFactory,

    @inject("Logger")
    logger: ILogger,
  ) {
    super(logger);
  }

  public override readonly commandName = "CheckOauthIntegrationStatusCommand";

  public override requiredPermissions: Permission[] = ["user", "admin", "system"];

  protected override async handle<TRole extends IRole>({
    command,
  }: IHandleContext<"CheckOauthIntegrationStatusCommand", TRole>): Promise<
    | {
        status: "connected";
        expiry: Date;
        refreshed: Date | undefined;
        created: Date;
      }
    | { status: "not_connected"; redirectUrl: string }
  > {
    this.logger.debug(`Checking oauth-integration status`, LOG_CONTEXT);

    const {
      data: { provider },
    } = command;

    const oauthClient = this.oauthClientFactory(provider);

    try {
      await using token = await this.tokenManager.getToken(this.currentUser.id, provider);

      return {
        status: "connected",
        refreshed: token.refreshed,
        expiry: token.expiry,
        created: token.created,
      };
    } catch (error: unknown) {
      if (error instanceof TokenWasNotFoundError) {
        return {
          redirectUrl: await oauthClient.generateRedirectUrl(),
          status: "not_connected",
        };
      }
      throw error;
    }
  }
}
