import { AccountsFetcherToken, TransactionFetcherToken } from "@ynab-plus/app";
import { ContainerModule } from "inversify";
import { YnabClient } from "./ynab/ynab-client.ts";

export const integrationsModule = new ContainerModule((load) => {
  load.bind(AccountsFetcherToken).to(YnabClient);
  load.bind(TransactionFetcherToken).to(YnabClient);
});
