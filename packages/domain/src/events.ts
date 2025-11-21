import type { Commands } from "./commands.ts";
import type { ICommandResponse } from "./i-command-response.ts";
import { type User } from "@user";
import type { Permission, SystemContext } from "@core";

export interface Events {
  AppInitialised: { url: string; port: number };
  AppClosing: undefined;
  CommandResponse: ICommandResponse<keyof Commands>;
  OauthIntegrationDisconnected: { provider: string };
  SocketOpened: undefined;
  RegisterSuccess: undefined;
  UserUpdateFail: { reason: string };
  RegisterFail: { reason: string };
  NotAuthorisedError: {
    role: User | SystemContext | undefined;
    handler: string;
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
