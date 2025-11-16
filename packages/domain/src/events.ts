import type { Account } from "./account.ts";
import type { Commands } from "./commands.ts";
import type { ICommandResponse } from "./i-command-response.ts";
import type { IUser } from "./i-user.ts";
import type { Permission } from "./permissions.ts";
import type { RegularTask } from "./regular-task.ts";

export interface Events {
  AppInitialised: { url: string; port: number };
  AppClosing: undefined;
  CommandResponse: ICommandResponse<keyof Commands>;
  OauthIntegrationDisconnected: { provider: string };
  SocketOpened: undefined;
  LogoutSuccess: undefined;
  LoginSuccess: undefined;
  LoginFail: undefined;
  HttpError: {
    statusCode: number;
    body: string;
  };
  AccountsSynced: Account[];
  RegisterSuccess: undefined;
  UserUpdateFail: { reason: string };
  ScheduledTaskUpdated: RegularTask;
  ScheduledTaskDeleted: RegularTask;
  ScheduledTaskCreated: RegularTask;
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
