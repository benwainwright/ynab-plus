import { AbstractApplicationService } from "@core";
import type {
  IBankConnectionCreator,
  IBankConnectionRepository,
  IOpenBankingTokenFetcher,
} from "@ports";
import type { ILogger } from "@ynab-plus/bootstrap";
import type { Permission } from "@ynab-plus/domain";
import type { BankConnection } from "node_modules/@ynab-plus/domain/src/bank-connection/bank-connection.ts";

export class CheckBankConnectionService extends AbstractApplicationService<"CheckBankConnectionCommand"> {
  public constructor(
    private bankConnectionRepo: IBankConnectionRepository,
    private tokenFetcher: IOpenBankingTokenFetcher,
    private institutionListFetcher: IBankConnectionCreator,
    logger: ILogger,
  ) {
    super(logger);
  }

  public override readonly commandName = "CheckBankConnectionCommand";

  public override requiredPermissions: Permission[] = ["admin", "user"];

  protected override async handle(): Promise<
    | { status: "new"; potentialInstitutions: BankConnection[] }
    | { status: "connected" }
  > {
    const connection = await this.bankConnectionRepo.getConnection(
      this.currentUser.id,
    );

    if (!connection) {
      return {
        status: "new",
        potentialInstitutions: await this.institutionListFetcher.getConnections(
          this.currentUser.id,
        ),
      };
    }

    return { status: "connected" };
  }
}
