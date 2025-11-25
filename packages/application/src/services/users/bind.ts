import { AbstractApplicationService } from "@core";
import { ServiceToken } from "@ports";
import type { ContainerModuleLoadOptions } from "inversify";
import { GetCurrentUserService } from "./get-current-user-service.ts";
import { GetUserService } from "./get-user-service.ts";
import { GetUsersService } from "./get-users-service.ts";
import { ListUsersService } from "./list-users-service.ts";
import { UpdateUserService } from "./update-user-service.ts";
import { RegisterUserService } from "./register-user-service.ts";

export const bind = (load: ContainerModuleLoadOptions) => {
  load.bind<AbstractApplicationService>(ServiceToken).to(GetCurrentUserService);
  load.bind<AbstractApplicationService>(ServiceToken).to(GetUserService);
  load.bind<AbstractApplicationService>(ServiceToken).to(GetUsersService);
  load.bind<AbstractApplicationService>(ServiceToken).to(ListUsersService);
  load.bind<AbstractApplicationService>(ServiceToken).to(UpdateUserService);
  load.bind<AbstractApplicationService>(ServiceToken).to(RegisterUserService);
};
