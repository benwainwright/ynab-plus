import { Account } from "./account.ts";
import { OauthToken } from "./oauth-token.ts";
import { RegularTask } from "./regular-task.ts";
import { User } from "./user.ts";

export const serialisableTypes = {
  user: User,
  account: Account,
  token: OauthToken,
  regularTask: RegularTask,
} as const;
