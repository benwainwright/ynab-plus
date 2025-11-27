import type { OauthToken } from "@ynab-plus/domain";
import type { ServiceIdentifier } from "inversify";
import type { ICreatable } from "./i-creatable.ts";

export interface IOauthTokenRepository extends ICreatable {
  get(userId: string, provider: string): Promise<OauthToken | undefined>;
  save(token: OauthToken): Promise<OauthToken>;
  delete(userId: string, provider: string): Promise<void>;
}

export const OauthTokenRepositoryToken: ServiceIdentifier<IOauthTokenRepository> =
  Symbol.for("OauthTokenRepository");
