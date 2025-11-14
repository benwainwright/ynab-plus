import type { IOauthRedirectUrlGenerator } from "./i-oauth-redirect-url-generator.ts";
import type { IOAuthTokenRefresher } from "./i-oauth-token-refresher.ts";

export type IOauthCheckerFactory = (
  provider: string,
) => IOauthRedirectUrlGenerator & IOAuthTokenRefresher;
