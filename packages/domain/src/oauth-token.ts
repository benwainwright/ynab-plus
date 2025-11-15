import { type IOauthToken, oAuthTokenSchema } from "./i-outh-token.ts";
import type { ISerialisable } from "./i-serialisable.ts";

export class OauthToken
  implements IOauthToken, ISerialisable<IOauthToken, "token">
{
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

  public toObject(): IOauthToken & { $type: "token" } {
    return this;
  }

  public static fromObject(data: unknown) {
    const parsed = oAuthTokenSchema.parse(data);
    return new OauthToken(parsed);
  }

  public readonly $type = "token";
}
