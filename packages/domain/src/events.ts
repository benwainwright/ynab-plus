import type { Commands } from "./commands.ts";
import type { IAccount } from "./i-account.ts";
import type { ICommandResponse } from "./i-command-response.ts";
import type { IUser } from "./i-user.ts";
import type { Permission } from "./permissions.ts";

export interface Events {
  AppInitialised: { url: string; port: number };
  AppClosing: undefined;
  CommandResponse: ICommandResponse<keyof Commands>;
  SocketOpened: undefined;
  LogoutSuccess: undefined;
  LoginSuccess: undefined;
  LoginFail: undefined;
  HttpError: {
    statusCode: number;
    body: string;
  };
  AccountsSynced: IAccount[];
  RegisterSuccess: undefined;
  UserUpdateFail: { reason: string };
  UserUpdated: IUser;
  RegisterFail: { reason: string };
  NotAuthorisedError: {
    userId: string | undefined;
    handler: string;
    userPermissions: Permission[];
    requiredPermissions: Permission[];
  };
  ApplicationError: {
    stack: {
      file: string;
      callee: string;
    }[];
    message: string;
  };
}
