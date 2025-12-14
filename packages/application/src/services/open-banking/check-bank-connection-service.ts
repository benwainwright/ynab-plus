import { inject, AbstractApplicationService } from "@core";

import {
  type IBankConnectionCreator,
  type IBankConnectionRepository,
  type IOauthTokenRepository,
  type IOpenBankingTokenFetcher,
  type IRequesitionAccountFetcher,
} from "@ports";

import { type ILogger } from "@ynab-plus/bootstrap";

import { BankConnection, OauthToken, type Permission } from "@ynab-plus/domain";

import { injectable } from "inversify";

@injectable()
export class CheckBankConnectionService extends AbstractApplicationService<"CheckBankConnectionCommand"> {
  public constructor(
    @inject("BankConnectionRepository")
    private bankConnectionRepo: IBankConnectionRepository,

    @inject("BankConnectionCreator")
    private institutionListFetcher: IBankConnectionCreator,

    @inject("BankConnectionTokenFetcher")
    private bankingTokenFetcher: IOpenBankingTokenFetcher,

    @inject("OauthTokenRepository")
    private oauthTokenRepository: IOauthTokenRepository,

    @inject("RequestionAccountFetcher")
    private requestionAccountFetcher: IRequesitionAccountFetcher,

    @inject("Logger")
    logger: ILogger,
  ) {
    super(logger);
  }

  public override readonly commandName = "CheckBankConnectionCommand";

  public override requiredPermissions: Permission[] = ["admin", "user"];

  private async getToken() {
    const token = await this.oauthTokenRepository.get(this.currentUser.id, "open-banking");

    if (token) {
      return token;
    }

    const tokenResponse = await this.bankingTokenFetcher.getNewToken();

    const newToken = OauthToken.create({
      provider: "open-banking",
      userId: this.currentUser.id,
      token: tokenResponse.token,
      refreshToken: tokenResponse.refreshToken,
      expiry: new Date(Date.now() + tokenResponse.tokenExpiresIn * 1000),
      refreshExpiry: new Date(Date.now() + tokenResponse.refreshTokenExpiresIn * 1000),
    });

    await this.oauthTokenRepository.save(newToken);
    return newToken;
  }

  protected override async handle(): Promise<
    { status: "new"; potentialInstitutions: BankConnection[] } | { status: "connected" }
  > {
    const connection = await this.bankConnectionRepo.getConnection(this.currentUser.id);

    if (connection) {
      if (!connection.accounts) {
        const ids = await this.requestionAccountFetcher.getAccountIds(connection);
        connection.saveAccounts(ids);
        await this.bankConnectionRepo.saveConnection(connection);
      }
      return { status: "connected" };
    } else {
      const token = await this.getToken();

      return {
        status: "new",
        potentialInstitutions: await this.institutionListFetcher.getConnections(
          this.currentUser.id,
          token,
        ),
      };
    }
  }
}
