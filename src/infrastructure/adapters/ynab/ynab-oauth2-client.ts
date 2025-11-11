import type { IOAuthRedirectUrlGenerator } from "@application/ports";
import type { ConfigValue } from "@bootstrap";

export class YnabOauth2Client implements IOAuthRedirectUrlGenerator {
  public constructor(
    private clientId: ConfigValue<string>,
    private redirectUri: ConfigValue<string>,
  ) {}

  public async getRedirectUrl(): Promise<string> {
    const redirectUri = encodeURIComponent(await this.redirectUri.value);
    const clientId = await this.clientId.value;

    return `https://app.ynab.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token`;
  }
}
