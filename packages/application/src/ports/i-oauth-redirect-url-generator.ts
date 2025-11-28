export interface IOauthRedirectUrlGenerator {
  generateRedirectUrl: () => Promise<string>;
}
