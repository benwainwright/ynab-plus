import { type IOauthClient } from "./i-oauth-client.ts";

export type OauthClientFactory = (provider: string) => IOauthClient;
