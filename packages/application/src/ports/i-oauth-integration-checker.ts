import type { OauthToken } from "@ynab-plus/domain";

export interface IOauthClient {
  generateRedirectUrl: () => Promise<string>;
  refreshToken(token: OauthToken): Promise<OauthToken>;
}
