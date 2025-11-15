import type { IOauthToken } from "./i-outh-token.ts";

export class OauthToken implements IOauthToken {
  public readonly provider: string;
  public readonly token: string;
  public readonly refreshToken: string;
  public readonly expiry: Date;
  public readonly userId: string;
  public readonly refreshed: Date | undefined;
  public readonly created: Date;
  public lastUse: Date | undefined;

  public constructor(config: IOauthToken) {
    this.expiry = config.expiry;
    this.token = config.token;
    this.refreshToken = config.refreshToken;
    this.provider = config.provider;
    this.userId = config.userId;
    this.lastUse = config.lastUse;
    this.refreshed = config.refreshed;
    this.created = config.created;
  }
}
