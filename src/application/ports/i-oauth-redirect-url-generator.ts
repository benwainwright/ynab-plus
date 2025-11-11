export interface IOAuthRedirectUrlGenerator {
  getRedirectUrl(): Promise<string>;
}
