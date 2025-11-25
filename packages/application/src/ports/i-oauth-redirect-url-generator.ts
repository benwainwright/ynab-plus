export interface IOauthRedirectUrlGenerator {
  generateRedirectUrl: () => Promise<string>;
}

export const OauthRedirectUrlGeneratorToken = Symbol.for(
  "RedirectUrlGenerator",
);
