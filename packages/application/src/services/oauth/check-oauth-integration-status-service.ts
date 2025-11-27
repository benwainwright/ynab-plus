import {
  type IHandleContext,
  type IOauthCheckerFactory,
  type IOauthTokenRepository,
} from "@ports";
import { type ILogger } from "@ynab-plus/bootstrap";
import type { IRole, Permission } from "@ynab-plus/domain";

export const LOG_CONTEXT = {
  context: "check-oauth-integration-status-service",
};

import { $inject, AbstractApplicationService } from "@core";
import { injectable } from "inversify";

@injectable()
export class CheckOauthIntegrationStatusService extends AbstractApplicationService<"CheckOauthIntegrationStatusCommand"> {
  public constructor(
    @$inject("OauthTokenRepository")
    private tokenRepository: IOauthTokenRepository,

    @$inject("OauthCheckerFactory")
    private oauthClientFactory: IOauthCheckerFactory,

    @$inject("Logger")
    logger: ILogger,
  ) {
    super(logger);
  }

  public override readonly commandName = "CheckOauthIntegrationStatusCommand";

  public override requiredPermissions: Permission[] = [
    "user",
    "admin",
    "system",
  ];

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

    const token = await this.tokenRepository.get(this.currentUser.id, provider);

    const oauthClient = this.oauthClientFactory(provider);

    if (!token) {
      this.logger.debug(`A token was not found in the repository`, LOG_CONTEXT);
      return {
        status: "not_connected",
        redirectUrl: await oauthClient.generateRedirectUrl(),
      };
    }
    this.logger.debug(`A token was found in the repository`, LOG_CONTEXT);

    if (token.expiry < new Date()) {
      this.logger.debug(`The token is out of date. Refreshing!`, LOG_CONTEXT);
      const newToken = await oauthClient.refreshToken(token);
      await this.tokenRepository.save(newToken);
    }

    return {
      status: "connected",
      refreshed: token.refreshed,
      expiry: token.expiry,
      created: token.created,
    };
  }
}
