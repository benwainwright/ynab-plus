import { inject, AbstractApplicationService } from "@core";
import { AppError } from "@errors";
import {
  type IBankConnectionRepository,
  type IHandleContext,
  type IInstitutionAuthPageLinkFetcher,
  type IOauthTokenRepository,
} from "@ports";
import { type ILogger } from "@ynab-plus/bootstrap";
import type { IRole, User } from "@ynab-plus/domain";
import { injectable } from "inversify";

@injectable()
export class GetInstitutionAuthorizationPageLinkService extends AbstractApplicationService<"GetInstitutionAuthorizationPageLinkCommand"> {
  public constructor(
    @inject("InstitutionAuthPageLinkFetcher")
    private authLinkFetcher: IInstitutionAuthPageLinkFetcher,

    @inject("BankConnectionRepository")
    private bankConnectionRepository: IBankConnectionRepository,

    @inject("OauthTokenRepository")
    private oauthTokenRepository: IOauthTokenRepository,

    @inject("Logger")
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
    const token = await this.oauthTokenRepository.get(
      this.currentUser.id,
      "open-banking",
    );

    if (!token) {
      throw new AppError("No bank token found");
    }

    const result = await this.authLinkFetcher.getLink(data, token);

    data.saveRequisitionId(result.requsitionId);

    await this.bankConnectionRepository.saveConnection(data);

    return { url: result.url };
  }
}
