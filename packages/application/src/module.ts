import { ContainerModule } from "inversify";

import { bind as bindAccountsServices } from "./services/accounts/index.ts";
import { bind as bindUsersServices } from "./services/users/index.ts";
import { bind as bindAuthServices } from "./services/auth/index.ts";
import { bind as bindOpenBankingServices } from "./services/open-banking/index.ts";
import { bind as bindTaskServices } from "./services/tasks/index.ts";
import { bind as bindOauthServices } from "./services/oauth/index.ts";

export const applicationServicesModule = new ContainerModule((load) => {
  bindAccountsServices(load);
  bindUsersServices(load);
  bindAuthServices(load);
  bindOpenBankingServices(load);
  bindTaskServices(load);
  bindOauthServices(load);
});
