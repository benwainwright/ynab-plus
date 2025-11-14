import type {
  IOauthNewTokenRequester,
  IOauthRedirectUrlGenerator,
  IOAuthTokenRefresher,
} from "@ynab-plus/app";
import type { ConfigValue } from "@ynab-plus/bootstrap";
import { OauthToken } from "@ynab-plus/domain";
import z from "zod";

const tokenCache = new Map<string, OauthToken>();

export class YnabOauth2Client
  implements
    IOauthRedirectUrlGenerator,
    IOauthNewTokenRequester,
    IOAuthTokenRefresher
{
  public constructor(
    private baseUrl: string,
    private clientId: ConfigValue<string>,
    private clientSecret: ConfigValue<string>,
    private redirectUri: ConfigValue<string>,
    private providerName: string,
  ) {}
  public async refreshToken(token: OauthToken): Promise<OauthToken> {
    const cacheKey = `${token.token}-${token.refreshToken}`;
    const cachedToken = tokenCache.get(cacheKey);
    if (cachedToken) {
      return cachedToken;
    }
    const formData = new FormData();
    formData.set("client_id", await this.clientId.value);
    formData.set("client_secret", await this.clientSecret.value);

    formData.set("grant_type", "refresh_token");
    formData.set("refresh_token", token.refreshToken);

    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Status code ${String(response.status)} was returned`);
    }

    const json = this.parseTokenResponse(await response.json());

    const newToken = new OauthToken({
      provider: this.providerName,
      token: json.access_token,
      refreshToken: json.refresh_token,
      expiry: new Date(Date.now() + json.expires_in * 1000),
      userId: token.userId,
    });

    tokenCache.set(cacheKey, newToken);
    setTimeout(() => {
      tokenCache.delete(cacheKey);
    }, 10_000);

    return newToken;
  }

  private parseTokenResponse = (data: unknown) => {
    const responseSchema = z.object({
      access_token: z.string(),
      token_type: z.string(),
      refresh_token: z.string(),
      expires_in: z.number(),
    });

    return responseSchema.parse(data);
  };

  public async newToken(userId: string, code: string): Promise<OauthToken> {
    const cacheKey = `${userId}-${code}`;
    const cachedToken = tokenCache.get(cacheKey);
    if (cachedToken) {
      return cachedToken;
    }
    const formData = new FormData();
    formData.set("client_id", await this.clientId.value);
    formData.set("client_secret", await this.clientSecret.value);

    formData.set("redirect_uri", await this.redirectUri.value);

    formData.set("grant_type", "authorization_code");
    formData.set("code", code);

    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(
        `Status code ${String(response.status)} was returned with body ${await response.text()}`,
      );
    }

    const json = this.parseTokenResponse(await response.json());

    const newToken = new OauthToken({
      provider: this.providerName,
      token: json.access_token,
      refreshToken: json.refresh_token,
      expiry: new Date(Date.now() + json.expires_in * 1000),
      userId,
    });

    tokenCache.set(cacheKey, newToken);
    setTimeout(() => {
      tokenCache.delete(cacheKey);
    }, 10_000);

    return newToken;
  }

  public async generateRedirectUrl(): Promise<string> {
    const redirectUri = encodeURIComponent(await this.redirectUri.value);
    const clientId = await this.clientId.value;

    return `${this.baseUrl}/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
  }
}
