import type { Permission } from "@types";

declare global {
  interface Events {
    SocketOpened: undefined;
    LogoutSuccess: undefined;
    LoginSuccess: undefined;
    LoginFail: undefined;
    RegisterSuccess: undefined;
    NotAuthorisedError: {
      userId: string | undefined;
      handler: string;
      userPermissions: Permission[];
      requiredPermissions: Permission[];
    };
    ApplicationError: {
      stack: {
        file: string;
        calee: string;
      }[];
      message: string;
    };
  }
}

export {};
