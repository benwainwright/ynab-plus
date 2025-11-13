import type {
  IHandleContext,
  IOauthTokenRepository,
  NewTokenRequesterFactory,
} from "@ports";
import { AbstractApplicationService } from "./abstract-application-service.ts";
import type { Permission } from "@ynab-plus/domain";
import type { ILogger } from "@ynab-plus/bootstrap";

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
    const requester = this.newTokenRequesterFactory(provider);

    const currentUser = await currentUserCache.get();

    if (!currentUser) {
      throw new Error(`No current user`);
    }

    const token = await requester.newToken(currentUser.id, code);

    this.tokenRepository.save(token);

    return {
      status: "connected",
    };
  }
}
