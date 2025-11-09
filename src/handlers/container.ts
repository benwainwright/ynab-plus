import { handlerToken } from "@tokens";
import { Container } from "inversify";

import type { ICommandHandler } from "@types";

import { GetCurrentUserCommandHandler } from "./get-current-user-command-handler.ts";
import { ListUsersCommandHandler } from "./list-users-command.ts";
import { LoginCommandHandler } from "./login-command.ts";
import { LogoutCommandHandler } from "./logout-command-handler.ts";
import { RegisterCommandHandler } from "./register-user-command.ts";

export const container = new Container();

container
  .bind<ICommandHandler<keyof Commands>>(handlerToken)
  .to(GetCurrentUserCommandHandler);

container
  .bind<ICommandHandler<keyof Commands>>(handlerToken)
  .to(ListUsersCommandHandler);

container
  .bind<ICommandHandler<keyof Commands>>(handlerToken)
  .to(LoginCommandHandler);

container
  .bind<ICommandHandler<keyof Commands>>(handlerToken)
  .to(LogoutCommandHandler);

container
  .bind<ICommandHandler<keyof Commands>>(handlerToken)
  .to(RegisterCommandHandler);
