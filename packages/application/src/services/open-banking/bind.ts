import { AbstractApplicationService } from "@core";
import { ServiceToken } from "@ports";
import type { ContainerModuleLoadOptions } from "inversify";
import { CheckBankConnectionService } from "./check-bank-connection-service.ts";
import { GetInstitutionAuthorizationPageLinkService } from "./get-institution-authorization-page-link-service.ts";

export const bind = (load: ContainerModuleLoadOptions) => {
  load
    .bind<AbstractApplicationService>(ServiceToken)
    .to(CheckBankConnectionService);

  load
    .bind<AbstractApplicationService>(ServiceToken)
    .to(GetInstitutionAuthorizationPageLinkService);
};
