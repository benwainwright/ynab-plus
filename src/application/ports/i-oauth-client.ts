import type { OauthToken } from "@domain";

export interface IOauthClient {
  generateRedirectUrl: () => Promise<string>;
  refresh(token: OauthToken): Promise<OauthToken>;
}
