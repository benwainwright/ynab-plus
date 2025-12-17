import type {
  Commands,
  ICommandResponse,
  Permission,
  SystemContext,
  User
} from "@ynab-plus/domain";

export interface CoreEvents {
  NotAuthorisedError: {
    role: User | SystemContext | undefined;
    handler: string;
    requiredPermissions: Permission[];
  };
  HttpError: {
    statusCode: number;
    body: string;
  };
  ApplicationError: {
    stack: {
      file: string;
      callee: string;
    }[];
    message: string;
  };
  CommandResponse: ICommandResponse<keyof Commands>;
}
