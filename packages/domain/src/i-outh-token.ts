export interface IOauthToken {
  expiry: Date;
  token: string;
  refreshToken: string;
  provider: string;
  userId: string;
  lastUse: Date | undefined;
  refreshed: Date | undefined;
  created: Date;
}
