import type {
  IHandleContext,
  IOauthCheckerFactory,
  IOauthTokenRepository,
} from "@ports";
import { AbstractApplicationService } from "./abstract-application-service.ts";
import { AppError } from "@errors";
import type { Permission } from "@ynab-plus/domain";

export class CheckOauthIntegrationStatusService extends AbstractApplicationService<"CheckOauthIntegrationStatusCommand"> {
  public constructor(
    private tokenRepository: IOauthTokenRepository,
    private oauthClientFactory: IOauthCheckerFactory,
  ) {
    super();
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

    const {
      data: { provider },
    } = command;

    if (!currentUser) {
      throw new AppError(`There was no current user - this is probably a bug!`);
    }

    const token = await this.tokenRepository.get(currentUser.id, provider);

    const oauthClient = this.oauthClientFactory(provider);

    if (!token) {
      return {
        status: "not_connected",
        redirectUrl: await oauthClient.generateRedirectUrl(),
      };
    }

    if (token.expiry < new Date()) {
      const newToken = await oauthClient.refreshToken(token);
      await this.tokenRepository.save(newToken);
    }

    return {
      status: "connected",
    };
  }
}
