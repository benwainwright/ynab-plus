import type { OauthToken } from "@domain";

export interface IOauthClient {
  generateRedirectUrl: () => Promise<string>;
  refreshToken(token: OauthToken): Promise<OauthToken>;
}
