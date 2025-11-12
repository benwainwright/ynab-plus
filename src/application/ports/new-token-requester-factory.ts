import type { IOauthNewTokenRequester } from "./i-oauth-new-token-requester.ts";

export type NewTokenRequesterFactory = (
  provider: string,
) => IOauthNewTokenRequester;
