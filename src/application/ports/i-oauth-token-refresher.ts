import type { OauthToken } from "@domain";

export interface IOAuthTokenRefresher {
  refresh(token: OauthToken): Promise<OauthToken>;
}
