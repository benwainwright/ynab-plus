import { DomainModel } from "@core";
import { oAuthTokenSchema, type IOauthToken } from "./i-outh-token.ts";
import { TokenExpiredError } from "@errors";

export class OauthToken extends DomainModel<IOauthToken> implements IOauthToken {
  public override freezeDry(config?: { secure: boolean }): IOauthToken {
    return {
      provider: this.provider,
      created: this.created,
      userId: this.userId,
      expiry: this.expiry,
      token: config?.secure ? this.token : ``,
      refreshToken: config?.secure ? this.refreshToken : ``,
      refreshed: this.refreshed,
      lastUse: this.lastUse,
      refreshExpiry: this.refreshExpiry
    };
  }
  public readonly provider: string;
  public readonly created: Date;
  public readonly userId: string;
  public expiry: Date;
  public token: string;
  public refreshToken: string;
  public refreshExpiry: Date | undefined;
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
    this.refreshExpiry = config.refreshExpiry;
    this.refreshed = config.refreshed;
    this.created = config.created;
  }

  public static create(config: Omit<IOauthToken, "created" | "lastUse" | "refreshed">) {
    const theToken = new OauthToken({
      ...config,
      created: new Date(),
      lastUse: undefined,
      refreshed: undefined
    });

    theToken.raiseEvent({ event: "OauthTokenCreated", data: theToken });
    return theToken;
  }

  public static reconstitute(config: IOauthToken) {
    return new OauthToken(oAuthTokenSchema.parse(config));
  }

  public delete() {
    this.raiseEvent({ event: "OauthTokenDeleted", data: this });
  }

  public refresh(newToken: string, newRefreshToken: string, expiry: Date, refreshExpiry?: Date) {
    const old = OauthToken.reconstitute(this.freezeDry({ secure: true }));

    this.token = newToken;
    this.refreshToken = newRefreshToken;
    this.refreshed = new Date();
    this.expiry = expiry;
    this.refreshExpiry = refreshExpiry;

    this.raiseEvent({ event: "OauthTokenRefreshed", data: { old, new: this } });
  }

  public isOutOfDate() {
    return this.expiry < new Date();
  }

  public use(): string {
    if (this.isOutOfDate()) {
      throw new TokenExpiredError(`Token for provider ${this.provider} has expired`, this.provider);
    }
    const token = this.token;
    this.lastUse = new Date();
    this.raiseEvent({ event: "OauthTokenUsed", data: this });
    return token;
  }
}
