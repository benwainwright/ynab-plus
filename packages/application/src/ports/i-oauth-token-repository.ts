import type { OauthToken } from "@ynab-plus/domain";

export interface IOauthTokenRepository {
  get(userId: string, provider: string): Promise<OauthToken | undefined>;
  save(token: OauthToken): Promise<OauthToken>;
}
