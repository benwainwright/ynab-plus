import type { OauthToken } from "@ynab-plus/domain";
import type { ICreatable } from "./i-creatable.ts";

export interface IOauthTokenRepository extends ICreatable {
  get(userId: string, provider: string): Promise<OauthToken | undefined>;
  save(token: OauthToken): Promise<OauthToken>;
  delete(token: OauthToken): Promise<void>;
}
