import type { Permission } from "@core";
import type { User } from "./user.ts";

export interface UsersCommands {
  ListUsersCommand: {
    request: {
      offset: number;
      limit: number;
    };
    response: User[];
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
}
