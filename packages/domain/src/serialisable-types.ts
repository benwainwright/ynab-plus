import { Account } from "./account.ts";
import { OauthToken } from "./oauth-token.ts";
import { User } from "./user.ts";

export const serialisableTypes = {
  user: User,
  account: Account,
  token: OauthToken,
} as const;
