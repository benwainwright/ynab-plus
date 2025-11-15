export interface IOauthToken {
  expiry: Date;
  token: string;
  refreshToken: string;
  provider: string;
  userId: string;
  lastUse: Date;
  refreshed: Date | undefined;
  created: Date;
}
