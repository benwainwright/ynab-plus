import type { IUser } from "@types";

declare global {
  interface Commands {
    ListTransactionsCommand: {
      request: undefined;
      response: void;
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
