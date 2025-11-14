import { AppError } from "@errors";
import type {
  IHandleContext,
  IOauthCheckerFactory,
  IOauthTokenRepository,
} from "@ports";
import type { ILogger } from "@ynab-plus/bootstrap";
import type { Permission } from "@ynab-plus/domain";

export const LOG_CONTEXT = {
  context: "check-oauth-integration-status-service",
};

import { AbstractApplicationService } from "./abstract-application-service.ts";

export class CheckOauthIntegrationStatusService extends AbstractApplicationService<"CheckOauthIntegrationStatusCommand"> {
  public constructor(
    private tokenRepository: IOauthTokenRepository,
    private oauthClientFactory: IOauthCheckerFactory,
    logger: ILogger,
  ) {
    super(logger);
  }

  public override readonly commandName = "CheckOauthIntegrationStatusCommand";

  public override requiredPermissions: Permission[] = ["user", "admin"];

  protected override async handle({
    currentUserCache,
    command,
  }: IHandleContext<"CheckOauthIntegrationStatusCommand">): Promise<
    { status: "connected" } | { status: "not_connected"; redirectUrl: string }
  > {
    const currentUser = await currentUserCache.get();

    this.logger.debug(`Checking oauth-integration status`, LOG_CONTEXT);

    const {
      data: { provider },
    } = command;

    if (!currentUser) {
      throw new AppError(`There was no current user - this is probably a bug!`);
    }

    const token = await this.tokenRepository.get(currentUser.id, provider);

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
    };
  }
}
