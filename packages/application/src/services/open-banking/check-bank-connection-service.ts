import { inject, AbstractApplicationService } from "@core";

import {
  type IBankConnectionCreator,
  type IBankConnectionRepository,
  type IRequesitionAccountFetcher
} from "@ports";

import { type ILogger } from "@ynab-plus/bootstrap";

import { BankConnection, type Permission } from "@ynab-plus/domain";

import { injectable } from "inversify";
import type { OpenBankingTokenManager } from "./open-banking-token-manager.ts";

@injectable()
export class CheckBankConnectionService extends AbstractApplicationService<"CheckBankConnectionCommand"> {
  public constructor(
    @inject("BankConnectionRepository")
    private bankConnectionRepo: IBankConnectionRepository,

    @inject("BankConnectionCreator")
    private institutionListFetcher: IBankConnectionCreator,

    @inject("RequestionAccountFetcher")
    private requestionAccountFetcher: IRequesitionAccountFetcher,

    @inject("OpenBankingTokenManager")
    private tokenManager: OpenBankingTokenManager,

    @inject("Logger")
    logger: ILogger
  ) {
    super(logger);
  }

  public override readonly commandName = "CheckBankConnectionCommand";

  public override requiredPermissions: Permission[] = ["admin", "user"];

  protected override async handle(): Promise<
    | { status: "new"; potentialInstitutions: BankConnection[] }
    | {
        status: "connected";
        logo: string;
        bankName: string;
        connected: Date;
        refreshed: Date | undefined;
        expires: Date;
      }
  > {
    const connection = await this.bankConnectionRepo.getConnection(this.currentUser.id);

    await using token = await this.tokenManager.getToken(this.currentUser.id);

    if (connection) {
      if (!connection.accounts) {
        const ids = await this.requestionAccountFetcher.getAccountIds(connection, token);
        connection.saveAccounts(ids);
        await this.bankConnectionRepo.saveConnection(connection);
      }
      return {
        status: "connected",
        logo: connection.logo,
        bankName: connection.bankName,
        connected: token.created,
        refreshed: token.refreshed,
        expires: token.expiry
      };
    } else {
      return {
        status: "new",
        potentialInstitutions: await this.institutionListFetcher.getConnections(
          this.currentUser.id,
          token
        )
      };
    }
  }
}
