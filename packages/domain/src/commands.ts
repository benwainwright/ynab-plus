import type { IAccount } from "./i-account.ts";
import type { IUser } from "./i-user.ts";
import type { Permission } from "./permissions.ts";
import type { RegularTask } from "./regular-task.ts";
import type { User } from "./user.ts";

export interface Commands {
  ListScheduledTasksCommand: {
    request: {
      offset: number;
      limit: number | undefined;
    };
    response: RegularTask[];
  };
  DeleteScheduledTaskCommand: {
    request: {
      id: string;
    };
    response: undefined;
  };
  SyncAccountsCommand: {
    request: { force: boolean };
    response: { synced: boolean };
  };
  DisconnectOauthIntegrationCommand: {
    request: { provider: string };
    response: undefined;
  };
  GenerateNewOauthTokenCommand: {
    request: {
      provider: string;
      code: string;
    };
    response: {
      status: "connected";
      expiry: Date;
      refreshed: Date | undefined;
      created: Date;
    };
  };
  CheckOauthIntegrationStatusCommand: {
    request: {
      provider: string;
    };
    response:
      | {
          status: "connected";
          expiry: Date;
          refreshed: Date | undefined;
          created: Date;
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
    response: User | undefined;
  };
  GetUserCommand: {
    request: {
      username: string;
    };
    response: User | undefined;
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
