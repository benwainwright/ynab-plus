import type { IBootstrapper, ILogger } from "@ynab-plus/bootstrap";

import { getOauthClientFactory } from "./get-oauth-client-factory.ts";
import { YnabClient } from "./ynab/ynab-client.ts";
import { GocardlessClient } from "./gocardless/gocardless-client.ts";
import z from "zod";

export const compose = (bootstrapper: IBootstrapper, logger: ILogger) => {
  const oauthClientFactory = getOauthClientFactory(bootstrapper);
  const ynabClient = new YnabClient(`https://api.ynab.com`, logger);

  const gocardlessClient = new GocardlessClient(
    `https://bankaccountdata.gocardless.com`,
    bootstrapper.configValue("gocardlessSecretId", z.string()),
    bootstrapper.configValue("gocardlessSecretKey", z.string()),
    logger,
  );

  return { oauthClientFactory, ynabClient, gocardlessClient };
};
