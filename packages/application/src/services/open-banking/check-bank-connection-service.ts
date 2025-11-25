import { AbstractApplicationService } from "@core";

import {
  BankConnectionCreatorToken,
  BankConnectionRepositoryToken,
  type IBankConnectionCreator,
  type IBankConnectionRepository,
} from "@ports";

import { LoggerToken, type ILogger } from "@ynab-plus/bootstrap";

import type { Permission } from "@ynab-plus/domain";

import { inject, injectable } from "inversify";

import type { BankConnection } from "node_modules/@ynab-plus/domain/src/bank-connection/bank-connection.ts";

@injectable()
export class CheckBankConnectionService extends AbstractApplicationService<"CheckBankConnectionCommand"> {
  public constructor(
    @inject(BankConnectionRepositoryToken)
    private bankConnectionRepo: IBankConnectionRepository,

    @inject(BankConnectionCreatorToken)
    private institutionListFetcher: IBankConnectionCreator,

    @inject(LoggerToken)
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
