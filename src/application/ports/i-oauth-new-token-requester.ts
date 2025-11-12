import type { OauthToken } from "@domain";

export interface IOauthNewTokenRequester {
  newToken: (userId: string, code: string) => Promise<OauthToken>;
}
