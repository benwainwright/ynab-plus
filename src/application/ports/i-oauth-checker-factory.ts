import type { IOAuthTokenRefresher } from "./i-oauth-token-refresher.ts";
import type { IOauthRedirectUrlGenerator } from "./i-redirect-url-generator.ts";

export type IOauthCheckerFactory = (
  provider: string,
) => IOauthRedirectUrlGenerator & IOAuthTokenRefresher;
