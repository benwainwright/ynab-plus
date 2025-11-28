import type { OauthToken } from "@ynab-plus/domain";

export interface IOauthNewTokenRequester {
  newToken: (userId: string, code: string) => Promise<OauthToken>;
}
