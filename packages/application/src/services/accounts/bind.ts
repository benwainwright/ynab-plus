import { AbstractApplicationService } from "@core";
import type { ContainerModuleLoadOptions } from "inversify";
import { ListAccountsService } from "./list-accounts-service.ts";
import { ServiceToken } from "@ports";
import { ListTransactionsService } from "./list-transactions-service.ts";
import { SyncAccountService } from "./sync-account-service.ts";

export const bind = (load: ContainerModuleLoadOptions) => {
  load.bind<AbstractApplicationService>(ServiceToken).to(ListAccountsService);

  load
    .bind<AbstractApplicationService>(ServiceToken)
    .to(ListTransactionsService);

  load.bind<AbstractApplicationService>(ServiceToken).to(SyncAccountService);
  load.bind<AbstractApplicationService>(ServiceToken).to(SyncAccountService);
};
