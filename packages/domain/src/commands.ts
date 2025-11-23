import type { AccountsCommands } from "@account";
import type { OauthTokenCommands } from "@oauth-token";
import type { RegularTasksCommands } from "@regular-task";
import type { TransactionCommands } from "@transaction";
import type { UsersCommands } from "@user";

export type Commands = {
  LoginCommand: {
    request: {
      username: string;
      password: string;
    };
    response: { success: true; id: string } | { success: false };
  };
  LogoutCommand: {
    request: undefined;
    response: undefined;
  };
} & RegularTasksCommands &
  UsersCommands &
  OauthTokenCommands &
  TransactionCommands &
  AccountsCommands;
