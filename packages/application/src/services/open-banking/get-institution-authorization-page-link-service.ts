import { AbstractApplicationService } from "@core";
import type { IHandleContext, IInstitutionAuthPageLinkFetcher } from "@ports";
import type { ILogger } from "@ynab-plus/bootstrap";
import type { IRole, User } from "@ynab-plus/domain";

export class GetInstitutionAuthorizationPageLinkService extends AbstractApplicationService<"GetInstitutionAuthorizationPageLinkCommand"> {
  public constructor(
    private authLinkFetcher: IInstitutionAuthPageLinkFetcher,
    logger: ILogger,
  ) {
    super(logger);
  }

  public override readonly commandName =
    "GetInstitutionAuthorizationPageLinkCommand";

  public override requiredPermissions: (
    | "public"
    | "user"
    | "admin"
    | "system"
  )[] = ["user", "admin"];

  protected override async handle<TRole extends IRole = User>({
    command: { data },
  }: IHandleContext<
    "GetInstitutionAuthorizationPageLinkCommand",
    TRole
  >): Promise<{ url: string }> {
    return { url: await this.authLinkFetcher.getLink(data) };
  }
}
