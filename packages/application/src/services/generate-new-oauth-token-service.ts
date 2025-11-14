import type {
  IHandleContext,
  IOauthTokenRepository,
  NewTokenRequesterFactory,
} from "@ports";
import type { ILogger } from "@ynab-plus/bootstrap";
import type { Permission } from "@ynab-plus/domain";

import { AbstractApplicationService } from "./abstract-application-service.ts";

const LOG_CONTEXT = { context: "geenrate-new-oauth-token-service" };

export class GenerateNewOauthTokenService extends AbstractApplicationService<"GenerateNewOauthTokenCommand"> {
  public override readonly commandName = "GenerateNewOauthTokenCommand";

  public override requiredPermissions: Permission[] = ["user", "admin"];

  public constructor(
    private tokenRepository: IOauthTokenRepository,
    private newTokenRequesterFactory: NewTokenRequesterFactory,
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
  }> {
    this.logger.silly(
      `Generating new oauth token for provider ${provider} with code ${code}`,
      LOG_CONTEXT,
    );

    const requester = this.newTokenRequesterFactory(provider);

    const currentUser = await currentUserCache.get();

    if (!currentUser) {
      throw new Error(`No current user`);
    }

    this.logger.silly(`Exchanging token`, LOG_CONTEXT);

    const token = await requester.newToken(currentUser.id, code);

    this.logger.silly(`Token exchanged`, LOG_CONTEXT);

    await this.tokenRepository.save(token);

    return {
      status: "connected",
    };
  }
}
