import {
  AccountsFetcherToken,
  BankConnectionCreatorToken,
  InstitutionAuthPageLinkFetcherToken,
  OauthCheckerFactoryToken,
  TransactionFetcherToken,
} from "@ynab-plus/app";
import { YnabClient } from "./ynab/ynab-client.ts";
import { applicationModule } from "@ynab-plus/bootstrap";
import {
  GocardlessClient,
  GocardlessClientSecretIdConfigValueToken,
  GocardlessClientSecretKeyConfigValueToken,
} from "./gocardless/gocardless-client.ts";
import z from "zod";
import { getOauthClientFactory } from "./get-oauth-client-factory.ts";

export const LOG_CONTEXT = { context: "integrations-module" };

export const integrationsModule = applicationModule(
  ({ load, logger, bootstrapper }) => {
    logger.info(`Initialising integrations module`, LOG_CONTEXT);

    load.bind(AccountsFetcherToken).to(YnabClient);
    load.bind(BankConnectionCreatorToken).to(GocardlessClient);
    load.bind(InstitutionAuthPageLinkFetcherToken).to(GocardlessClient);
    load.bind(OauthCheckerFactoryToken).toFactory(() => {
      return getOauthClientFactory(bootstrapper);
    });

    load
      .bind(GocardlessClientSecretIdConfigValueToken)
      .toConstantValue(
        bootstrapper.configValue("gocardlessSecretId", z.string()),
      );

    load
      .bind(GocardlessClientSecretKeyConfigValueToken)
      .toConstantValue(
        bootstrapper.configValue("gocardlessSecretKey", z.string()),
      );

    load.bind(TransactionFetcherToken).to(YnabClient);
    logger.debug(`Finished initialising integrations module`, LOG_CONTEXT);
  },
);
