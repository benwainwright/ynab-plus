import { type IIntegrationPorts } from "@ynab-plus/app";
import { YnabClient } from "./ynab/ynab-client.ts";
import {
  ConfigValue,
  typedApplicationModule,
  type BootstrapTypes,
} from "@ynab-plus/bootstrap";
import { GocardlessClient } from "./gocardless/gocardless-client.ts";
import z from "zod";
import { getOauthClientFactory } from "./get-oauth-client-factory.ts";

export const LOG_CONTEXT = { context: "integrations-module" };

interface IIntegrationsConfig {
  GocardlessClientSecretIdConfigValue: ConfigValue<string>;
  GocardlessClientSecretKeyConfigValue: ConfigValue<string>;
  TransactionFetcherToken: ConfigValue<string>;
}

export const integrationsModule = typedApplicationModule<
  IIntegrationPorts & IIntegrationsConfig & BootstrapTypes
>(({ load, logger, bootstrapper }) => {
  logger.info(`Initialising integrations module`, LOG_CONTEXT);

  load.bind("AccountsFetcher").to(YnabClient);
  load.bind("BankConnectionCreator").to(GocardlessClient);
  load.bind("InstitutionAuthPageLinkFetcher").to(GocardlessClient);

  load.bind("OauthCheckerFactory").toFactory(() => {
    return getOauthClientFactory(bootstrapper);
  });

  load
    .bind("GocardlessClientSecretIdConfigValue")
    .toConstantValue(
      bootstrapper.configValue("gocardlessSecretId", z.string()),
    );

  load
    .bind("GocardlessClientSecretKeyConfigValue")
    .toConstantValue(
      bootstrapper.configValue("gocardlessSecretKey", z.string()),
    );

  load
    .bind("TransactionFetcherToken")
    .toConstantValue(
      bootstrapper.configValue("TransactionFetcherToken", z.string()),
    );

  logger.debug(`Finished initialising integrations module`, LOG_CONTEXT);
});
