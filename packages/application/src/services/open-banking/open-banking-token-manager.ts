import type {
  IOauthTokenRepository,
  IOpenBankingTokenFetcher,
  IOpenBankingTokenRefresher
} from "@ports";
import type { ILogger } from "@ynab-plus/bootstrap";
import { OauthToken } from "@ynab-plus/domain";
import { inject, injectable } from "inversify";

export const LOG_CONTEXT = { context: "open-banking-token-manager" };

@injectable()
export class OpenBankingTokenManager {
  public constructor(
    @inject("OauthTokenRepository")
    private oauthTokenRepository: IOauthTokenRepository,

    @inject("OpenBankingTokenRefresher")
    private tokenRefresher: IOpenBankingTokenRefresher,

    @inject("BankConnectionTokenFetcher")
    private bankingTokenFetcher: IOpenBankingTokenFetcher,

    @inject("Logger")
    private logger: ILogger
  ) {}

  private returnDisposable(token: OauthToken) {
    return Object.assign(token, {
      [Symbol.asyncDispose]: async () => {
        if (token.hasEvents()) {
          await this.oauthTokenRepository.save(token);
        }
      }
    });
  }

  public async getToken(currentUserId: string) {
    this.logger.debug(`Fetching token for ${currentUserId}`, LOG_CONTEXT);
    const token = await this.oauthTokenRepository.get(currentUserId, "open-banking");

    if (token) {
      this.logger.debug(`Token found`, LOG_CONTEXT);
      if (token.isOutOfDate()) {
        this.logger.debug(`Token is out of date - refreshing...`, LOG_CONTEXT);
        const refreshedToken = await this.tokenRefresher.refreshToken(token);
        token.refresh(
          refreshedToken.token,
          token.refreshToken,
          new Date(Date.now() + refreshedToken.tokenExpiresIn * 1000),
          token.refreshExpiry
        );

        await this.oauthTokenRepository.save(token);
        return this.returnDisposable(token);
      }
      return this.returnDisposable(token);
    }

    this.logger.debug(`No token found, creating a new one`, LOG_CONTEXT);
    const tokenResponse = await this.bankingTokenFetcher.getNewToken();

    const newToken = OauthToken.create({
      provider: "open-banking",
      userId: currentUserId,
      token: tokenResponse.token,
      refreshToken: tokenResponse.refreshToken,
      expiry: new Date(Date.now() + tokenResponse.tokenExpiresIn * 1000),
      refreshExpiry: new Date(Date.now() + tokenResponse.refreshTokenExpiresIn * 1000)
    });

    await this.oauthTokenRepository.save(newToken);
    return this.returnDisposable(newToken);
  }
}
