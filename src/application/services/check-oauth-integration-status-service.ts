import type {
  IHandleContext,
  IOAuthRedirectUrlGenerator,
  IOAuthTokenRefresher,
  IOauthTokenRepository,
} from "@application/ports";
import { AbstractApplicationService } from "./abstract-application-service.ts";
import { AppError } from "@application/errors";

export class CheckOauthIntegrationStatusService extends AbstractApplicationService<"CheckOauthIntegrationStatusCommand"> {
  public constructor(
    private tokenRepository: IOauthTokenRepository,
    private redirectUrlGenerator: IOAuthRedirectUrlGenerator,
    private oauthTokenRefresher: IOAuthTokenRefresher,
  ) {
    super();
  }

  public override readonly commandName = "CheckOauthIntegrationStatusCommand";

  public override requiredPermissions: ("public" | "user" | "admin")[] = [
    "user",
    "admin",
  ];

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
    console.log({ token });

    if (!token) {
      return {
        status: "not_connected",
        redirectUrl: this.redirectUrlGenerator.getRedirectUrl(),
      };
    }

    if (token.expiry < new Date()) {
      const newToken = await this.oauthTokenRefresher.refresh(token);
      await this.tokenRepository.save(newToken);
    }

    return {
      status: "connected",
    };
  }
}
