import { AbstractApplicationService } from "@core";
import { ServiceToken } from "@ports";
import type { ContainerModuleLoadOptions } from "inversify";
import { CheckOauthIntegrationStatusService } from "./check-oauth-integration-status-service.ts";
import { DisconnectOauthIntegrationService } from "./disconnect-oauth-integration-service.ts";
import { GenerateNewOauthTokenService } from "./generate-new-oauth-token-service.ts";

export const bind = (load: ContainerModuleLoadOptions) => {
  load
    .bind<AbstractApplicationService>(ServiceToken)
    .to(CheckOauthIntegrationStatusService);

  load
    .bind<AbstractApplicationService>(ServiceToken)
    .to(DisconnectOauthIntegrationService);

  load
    .bind<AbstractApplicationService>(ServiceToken)
    .to(GenerateNewOauthTokenService);
};
