import { DomainModel } from "@core";
import { oAuthTokenSchema, type IOauthToken } from "./i-outh-token.ts";

export class OauthToken extends DomainModel implements IOauthToken {
  public readonly provider: string;
  public readonly created: Date;
  public readonly userId: string;
  public expiry: Date;
  public token: string;
  public refreshToken: string;
  public refreshed: Date | undefined;
  public lastUse: Date | undefined;

  private constructor(config: IOauthToken) {
    super();
    this.expiry = config.expiry;
    this.token = config.token;
    this.refreshToken = config.refreshToken;
    this.provider = config.provider;
    this.userId = config.userId;
    this.lastUse = config.lastUse;
    this.refreshed = config.refreshed;
    this.created = config.created;
  }

  public static create(
    config: Omit<IOauthToken, "created" | "lastUse" | "refreshed">,
  ) {
    const theToken = new OauthToken({
      ...config,
      created: new Date(),
      lastUse: undefined,
      refreshed: undefined,
    });

    theToken.raiseEvent({ event: "OauthTokenCreated", data: theToken });
    return theToken;
  }

  public static reconstitute(config: IOauthToken) {
    return new OauthToken(oAuthTokenSchema.parse(config));
  }

  public refresh(newToken: string, newRefreshToken: string, expiry: Date) {
    const old = OauthToken.reconstitute(this);

    this.token = newToken;
    this.refreshToken = newRefreshToken;
    this.refreshed = new Date();
    this.expiry = expiry;

    this.raiseEvent({ event: "OauthTokenRefreshed", data: { old, new: this } });
  }

  public use(): string {
    const token = this.token;
    this.lastUse = new Date();
    this.raiseEvent({ event: "OauthTokenUsed", data: this });
    return token;
  }
}
