import type { IBootstrapper } from "@ynab-plus/bootstrap";
import z from "zod";

import { YnabOauth2Client } from "./ynab-oauth2-client.ts";

export const oauthClientFactory =
  (bootstrapper: IBootstrapper) => (provider: string) => {
    switch (provider) {
      case "ynab":
        return new YnabOauth2Client(
          `https://app.ynab.com`,
          bootstrapper.configValue(`ynabClientId`, z.string()),
          bootstrapper.configValue(`ynabClientSecret`, z.string()),
          bootstrapper.configValue(`ynabRedirectUri`, z.string()),
          `ynab`,
        );
    }

    throw new Error(`Oauth provider not recognised!`);
  };
