import type { Commands } from "./commands.ts";
import type { ICommandResponse } from "./i-command-response.ts";
import type { Permission } from "./permissions.ts";

export interface Events {
  AppInitialised: { url: string; port: number };
  AppClosing: undefined;
  CommandResponse: ICommandResponse<keyof Commands>;
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
