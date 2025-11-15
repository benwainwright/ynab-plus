import type { IAccount } from "./i-account.ts";
import type { IUser } from "./i-user.ts";
import type { Permission } from "./permissions.ts";

export interface Commands {
  SyncAccountsCommand: {
    request: { force: boolean };
    response: { synced: boolean };
  };
  GenerateNewOauthTokenCommand: {
    request: {
      provider: string;
      code: string;
    };
    response: {
      status: "connected";
    };
  };
  CheckOauthIntegrationStatusCommand: {
    request: {
      provider: string;
    };
    response:
      | {
          status: "connected";
        }
      | {
          status: "not_connected";
          redirectUrl: string;
        };
  };
  ListTransactionsCommand: {
    request: undefined;
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    response: void;
  };
  ListAccountsCommand: {
    request: undefined;
    response: IAccount[];
  };
  ListUsersCommand: {
    request: {
      offset: number;
      limit: number;
    };
    response: IUser[];
  };
  LoginCommand: {
    request: {
      username: string;
      password: string;
    };
    response: { success: true; id: string } | { success: false };
  };
  UpdateUserCommand: {
    request: {
      username: string;
      email: string;
      password: string;
      permissions: Permission[];
    };
    response: { success: true } | { success: false; reason: string };
  };
  RegisterCommand: {
    request: {
      username: string;
      email: string;
      password: string;
    };
    response:
      | { success: true; id: string }
      | { success: false; reason: string };
  };
  LogoutCommand: {
    request: undefined;
    response: undefined;
  };
  GetCurrentUserCommand: {
    request: undefined;
    response: IUser | undefined;
  };
  GetUserCommand: {
    request: {
      username: string;
    };
    response: IUser | undefined;
  };
  HelloWorldCommand: {
    request: {
      data: string;
    };
    response: {
      hello: string;
    };
  };
}
