import type { ContainerModuleLoadOptions } from "inversify";

import { bind as bindAccountsServices } from "./accounts/index.ts";
import { bind as bindUsersServices } from "./users/index.ts";
import { bind as bindAuthServices } from "./auth/index.ts";
import { bind as bindOpenBankingServices } from "./open-banking/index.ts";
import { bind as bindTaskServices } from "./tasks/index.ts";
import { bind as bindOauthServices } from "./oauth/index.ts";

export const loadServices = (load: ContainerModuleLoadOptions) => {
  bindAccountsServices(load);
  bindUsersServices(load);
  bindAuthServices(load);
  bindOpenBankingServices(load);
  bindTaskServices(load);
  bindOauthServices(load);
};
