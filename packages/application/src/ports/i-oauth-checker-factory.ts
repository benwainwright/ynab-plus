import type { Factory, ServiceIdentifier } from "inversify";
import type { IOauthRedirectUrlGenerator } from "./i-oauth-redirect-url-generator.ts";
import type { IOAuthTokenRefresher } from "./i-oauth-token-refresher.ts";
import type { IOauthNewTokenRequester } from "./i-oauth-new-token-requester.ts";

export type IOauthCheckerFactory = (
  provider: string,
) => IOauthRedirectUrlGenerator &
  IOAuthTokenRefresher &
  IOauthNewTokenRequester;

export const OauthCheckerFactoryToken: ServiceIdentifier<
  Factory<IOauthCheckerFactory>
> = Symbol.for("OauthCheckerFactory");
