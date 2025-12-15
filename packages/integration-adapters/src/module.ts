import { type IIntegrationPorts } from "@ynab-plus/app";
import { YnabClient } from "./ynab/ynab-client.ts";
import { typedApplicationModule } from "@ynab-plus/bootstrap";
import { GocardlessClient } from "./gocardless/gocardless-client.ts";
import z from "zod";
import { getOauthClientFactory } from "./get-oauth-client-factory.ts";
import type { IInternalTypes } from "@core";
import type { TypedContainerModule } from "@inversifyjs/strongly-typed";
import { ResponseCache } from "@http-client";

export const LOG_CONTEXT = { context: "integrations-module" };

export const integrationsModule: TypedContainerModule<IIntegrationPorts & IInternalTypes> =
  typedApplicationModule<IIntegrationPorts & IInternalTypes>(({ load, logger, bootstrapper }) => {
    logger.info(`Initialising integrations module`, LOG_CONTEXT);

    load.bind("AccountsFetcher").to(YnabClient);
    load.bind("TransactionFetcher").to(YnabClient);
    load.bind("BankConnectionCreator").to(GocardlessClient);
    load.bind("BankConnectionTokenFetcher").to(GocardlessClient);
    load.bind("InstitutionAuthPageLinkFetcher").to(GocardlessClient);
    load.bind("RequestionAccountFetcher").to(GocardlessClient);
    load.bind("OpenBankingAccountBalanceFetcher").to(GocardlessClient);
    load.bind("OpenBankingAccountDetailsFetcher").to(GocardlessClient);
    load.bind("ResponseCache").to(ResponseCache);

    const oauthClientFactory = getOauthClientFactory(bootstrapper);

    load.bind("OauthCheckerFactory").toFactory(() => {
      return oauthClientFactory;
    });

    load
      .bind("GocardlessRedirectUrlConfigValue")
      .toConstantValue(bootstrapper.configValue("gocardlessRedirectUrl", z.string()));

    load
      .bind("GocardlessClientSecretIdConfigValue")
      .toConstantValue(bootstrapper.configValue("gocardlessSecretId", z.string()));

    load
      .bind("GocardlessClientSecretKeyConfigValue")
      .toConstantValue(bootstrapper.configValue("gocardlessSecretKey", z.string()));

    logger.debug(`Finished initialising integrations module`, LOG_CONTEXT);
  });
