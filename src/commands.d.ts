import type { IUser } from "@types";

declare global {
  interface Commands {
    ListTransactionsCommand: {
      request: undefined;
      response: void;
    };
    ListUsersCommand: {
      request: {
        offset: number;
        limit: numbrer;
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
    GetCurrentUser: {
      request: undefined;
      response: IUser | undefined;
    };
    GetUser: {
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
}

export {};
