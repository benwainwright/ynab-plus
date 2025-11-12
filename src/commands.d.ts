import type { User } from "@domain";

declare global {
  interface Commands {
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
      response: void;
    };
    ListUsersCommand: {
      request: {
        offset: number;
        limit: numbrer;
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
}

export {};
