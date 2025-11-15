import type { IBootstrapper, ILogger } from "@ynab-plus/bootstrap";

import { getOauthClientFactory } from "./get-oauth-client-factory.ts";
import { YnabClient } from "./ynab/ynab-client.ts";

export const compose = (bootstrapper: IBootstrapper, logger: ILogger) => {
  const oauthClientFactory = getOauthClientFactory(bootstrapper);
  const ynabClient = new YnabClient(`https://api.ynab.com`, logger);

  return { oauthClientFactory, ynabClient };
};
