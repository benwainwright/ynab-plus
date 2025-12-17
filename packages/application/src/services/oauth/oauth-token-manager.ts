import { inject } from "@core";
import type { IOauthCheckerFactory, IOauthTokenRepository } from "@ports";
import type { ILogger } from "@ynab-plus/bootstrap";
import { TokenWasNotFoundError } from "./no-token-found-error.ts";
import type { OauthToken } from "@ynab-plus/domain";

const LOG_CONTEXT = { context: "oauth-token-manager" };

export class OauthTokenManager {
  public constructor(
    @inject("OauthTokenRepository")
    private tokenRepository: IOauthTokenRepository,

    @inject("OauthCheckerFactory")
    private clientFactory: IOauthCheckerFactory,

    @inject("Logger")
    private logger: ILogger
  ) {}

  private returnDisposable(token: OauthToken) {
    return Object.assign(token, {
      [Symbol.asyncDispose]: async () => {
        if (token.hasEvents()) {
          await this.tokenRepository.save(token);
        }
      }
    });
  }

  public async getToken(currentUser: string, provider: string) {
    const token = await this.tokenRepository.get(currentUser, provider);

    const oauthClient = this.clientFactory(provider);

    if (!token) {
      this.logger.debug(`A token was not found in the repository`, LOG_CONTEXT);
      throw new TokenWasNotFoundError(`No token found for ${currentUser} for provider ${provider}`);
    }

    this.logger.debug(`A token was found in the repository`, LOG_CONTEXT);

    if (token.isOutOfDate()) {
      this.logger.debug(`The token is out of date. Refreshing!`, LOG_CONTEXT);
      const newToken = await oauthClient.refreshToken(token);
      await this.tokenRepository.save(newToken);
      return this.returnDisposable(newToken);
    }

    return this.returnDisposable(token);
  }
}
