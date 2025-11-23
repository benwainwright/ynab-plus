export interface IOpenBankingTokenFetcher {
  getNewToken(): Promise<{
    token: string;
    tokenExpiresIn: number;
    refreshToken: string;
    refreshTokenExpiresIn: number;
  }>;
}
