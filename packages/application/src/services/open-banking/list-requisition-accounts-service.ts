import { AbstractApplicationService, inject } from "@core";
import { AppError } from "@errors";
import type { IBankConnectionRepository, IOpenBankingAccountDetailsFetcher } from "@ports";
import type { ILogger } from "@ynab-plus/bootstrap";
import type { Permission } from "@ynab-plus/domain";
import type { OpenBankingTokenManager } from "./open-banking-token-manager.ts";

export class ListRequisitionAccountsService extends AbstractApplicationService<"ListRequisitionAccountsCommand"> {
  public override readonly commandName = "ListRequisitionAccountsCommand";

  public override requiredPermissions: Permission[] = ["user", "admin"];

  public constructor(
    @inject("OpenBankingAccountDetailsFetcher")
    private readonly accountDetailsFetcher: IOpenBankingAccountDetailsFetcher,

    @inject("BankConnectionRepository")
    private readonly bankConnectionRepo: IBankConnectionRepository,

    @inject("OpenBankingTokenManager")
    private readonly tokenManager: OpenBankingTokenManager,

    @inject("Logger")
    logger: ILogger,
  ) {
    super(logger);
  }

  protected override async handle(): Promise<
    {
      id: string;
      name: string | undefined;
    }[]
  > {
    const tokenPromise = this.tokenManager.getToken(this.currentUser.id);

    const connectionPromise = this.bankConnectionRepo.getConnection(this.currentUser.id);

    const token = await tokenPromise;
    const connection = await connectionPromise;

    if (!connection || !connection.accounts) {
      throw new AppError("Not connected to bank");
    }

    return await this.accountDetailsFetcher.getAccountDetails(connection.accounts, token);
  }
}
