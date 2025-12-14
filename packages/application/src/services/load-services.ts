import { LoginService } from "./auth/login-service.ts";
import { LogoutService } from "./auth/logout-service.ts";
import { ListAccountsService } from "./accounts/list-accounts-service.ts";
import { ListTransactionsService } from "./accounts/list-transactions-service.ts";
import { SyncAccountService } from "./accounts/sync-account-service.ts";
import { CheckOauthIntegrationStatusService } from "./oauth/check-oauth-integration-status-service.ts";
import { DisconnectOauthIntegrationService } from "./oauth/disconnect-oauth-integration-service.ts";
import { GenerateNewOauthTokenService } from "./oauth/generate-new-oauth-token-service.ts";
import { CheckBankConnectionService } from "./open-banking/check-bank-connection-service.ts";
import { GetInstitutionAuthorizationPageLinkService } from "./open-banking/get-institution-authorization-page-link-service.ts";
import { ListScheduledTasksService } from "./tasks/list-scheduled-tasks-service.ts";
import { UpdateScheduledTaskService } from "./tasks/update-scheduled-task-service.ts";
import { GetCurrentUserService } from "./users/get-current-user-service.ts";
import { GetUserService } from "./users/get-user-service.ts";
import { GetUsersService } from "./users/get-users-service.ts";
import { ListUsersService } from "./users/list-users-service.ts";
import { RegisterUserService } from "./users/register-user-service.ts";
import { UpdateUserService } from "./users/update-user-service.ts";
import { SyncAccountsService } from "./accounts/sync-accounts-service.ts";
import type { TypedContainerModuleLoadOptions } from "@inversifyjs/strongly-typed";
import type { IApplicationDependencies } from "@ports/groups";
import { CompareBalanceService } from "./accounts/compare-balance-service.ts";
import { ListRequisitionAccountsService } from "./open-banking/list-requisition-accounts-service.ts";

export const loadServices = (load: TypedContainerModuleLoadOptions<IApplicationDependencies>) => {
  if (load.isBound("CurrentUserSetter")) {
    load.bind("Service").to(LoginService);
    load.bind("Service").to(LogoutService);
  }

  load.bind("Service").to(ListAccountsService);
  load.bind("Service").to(ListTransactionsService);
  load.bind("Service").to(SyncAccountService);
  load.bind("Service").to(SyncAccountsService);
  load.bind("Service").to(CheckBankConnectionService);
  load.bind("Service").to(GetInstitutionAuthorizationPageLinkService);
  load.bind("Service").to(GetCurrentUserService);
  load.bind("Service").to(GetUserService);
  load.bind("Service").to(GetUsersService);
  load.bind("Service").to(ListUsersService);
  load.bind("Service").to(UpdateUserService);
  load.bind("Service").to(RegisterUserService);
  load.bind("Service").to(ListScheduledTasksService);
  load.bind("Service").to(UpdateScheduledTaskService);
  load.bind("Service").to(CheckOauthIntegrationStatusService);
  load.bind("Service").to(DisconnectOauthIntegrationService);
  load.bind("Service").to(GenerateNewOauthTokenService);
  load.bind("Service").to(ListRequisitionAccountsService);
  load.bind("Service").to(CompareBalanceService);
};
