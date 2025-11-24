import type { IAccount } from "./account/i-account.ts";
import type { IUser, User } from "@user";
import type { Permission } from "@core";
import type { RegularTask } from "@regular-task";
import type { Transaction } from "@transaction";
import type { BankConnectionCommands } from "@bank-connection";

export type Commands = {
  SyncAccountCommand: {
    request: {
      id: string;
    };
    response: { success: false; reason: string } | { success: true };
  };
  ListTransactionsCommand: {
    request: {
      accountId: string;
      offset: number;
      limit: number;
    };
    response: { transactions: Transaction[]; count: number };
  };
  ListScheduledTasksCommand: {
    request: {
      offset: number;
      limit: number | undefined;
    };
    response: RegularTask[];
  };
  UpdateScheduledTaskCommand: {
    request: RegularTask;
    response: { success: boolean };
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
  GetUsersCommand: {
    request: {
      usernames: string[];
    };
    response: (User | undefined)[];
  };
  HelloWorldCommand: {
    request: {
      data: string;
    };
    response: {
      hello: string;
    };
  };
} & BankConnectionCommands;
