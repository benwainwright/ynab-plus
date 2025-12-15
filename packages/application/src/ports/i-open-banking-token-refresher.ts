import type { OauthToken } from "@ynab-plus/domain";

export interface IOpenBankingTokenRefresher {
  refreshToken(token: OauthToken): Promise<{
    token: string;
    tokenExpiresIn: number;
  }>;
}
