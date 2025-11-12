import type { OauthToken } from "@domain";

export interface IOauthNewTokenRequester {
  newToken: (code: string) => Promise<OauthToken>;
}
