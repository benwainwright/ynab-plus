import type { OauthToken } from "@domain";

export interface IOAuthTokenRefresher {
  refreshToken(token: OauthToken): Promise<OauthToken>;
}
