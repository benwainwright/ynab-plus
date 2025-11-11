import type { OauthToken } from "@domain";

export interface IOauthTokenRepository {
  get(userId: string, provider: string): Promise<OauthToken | undefined>;
  save(token: OauthToken): Promise<void>;
}
