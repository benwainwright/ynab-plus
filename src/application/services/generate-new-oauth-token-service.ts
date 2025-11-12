import type {
  IHandleContext,
  IOauthTokenRepository,
  NewTokenRequesterFactory,
} from "@application/ports";
import { AbstractApplicationService } from "./abstract-application-service.ts";
import type { Permission } from "@domain";

export class GenerateNewOauthTokenService extends AbstractApplicationService<"GenerateNewOauthTokenCommand"> {
  public override readonly commandName = "GenerateNewOauthTokenCommand";

  public override requiredPermissions: Permission[] = ["user", "admin"];

  public constructor(
    private tokenRepository: IOauthTokenRepository,
    private newTokenRequesterFactory: NewTokenRequesterFactory,
  ) {
    super();
  }

  protected override async handle({
    command: {
      data: { code, provider },
    },
  }: IHandleContext<"GenerateNewOauthTokenCommand">): Promise<{
    status: "connected";
  }> {
    const requester = this.newTokenRequesterFactory(provider);

    const token = await requester.newToken(code);

    this.tokenRepository.save(token);

    return {
      status: "connected",
    };
  }
}
