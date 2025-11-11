export class OauthToken {
  public readonly provider: string;
  public readonly token: string;
  public readonly refreshToken: string;
  public readonly expiry: Date;

  public constructor(config: {
    expiry: Date;
    token: string;
    refreshToken: string;
    provider: string;
  }) {
    this.expiry = config.expiry;
    this.token = config.token;
    this.refreshToken = config.refreshToken;
    this.provider = config.provider;
  }
}
