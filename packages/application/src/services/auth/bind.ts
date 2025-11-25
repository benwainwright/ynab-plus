import type { AbstractApplicationService } from "@core";
import { ServiceToken } from "@ports";
import type { ContainerModuleLoadOptions } from "inversify";
import { LoginService } from "./login-service.ts";
import { LogoutService } from "./logout-service.ts";

export const bind = (load: ContainerModuleLoadOptions) => {
  load.bind<AbstractApplicationService>(ServiceToken).to(LoginService);
  load.bind<AbstractApplicationService>(ServiceToken).to(LogoutService);
};
