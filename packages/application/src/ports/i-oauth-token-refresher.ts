import type { OauthToken } from "@ynab-plus/domain";

export interface IOAuthTokenRefresher {
  refreshToken(token: OauthToken): Promise<OauthToken>;
}
