import type { User } from "./user.ts";

export interface Commands {
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
  ListUsersCommand: {
    request: {
      offset: number;
      limit: number;
    };
    response: User[];
  };
  LoginCommand: {
    request: {
      username: string;
      password: string;
    };
    response: { success: true; id: string } | { success: false };
  };
  RegisterCommand: {
    request: {
      username: string;
      email: string;
      password: string;
    };
    response: { success: boolean; id: string };
  };
  Logout: {
    request: undefined;
    response: undefined;
  };
  GetCurrentUserCommand: {
    request: undefined;
    response: User | undefined;
  };
  GetUser: {
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
