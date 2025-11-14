import { ConfigValue } from "@ynab-plus/bootstrap";

import { YnabOauth2Client } from "./ynab-oauth2-client.ts";

export const oauthClientFactory =
  (
    ynabClientId: ConfigValue<string>,
    ynabClientSecret: ConfigValue<string>,
    ynabRedirectUri: ConfigValue<string>,
  ) =>
  (provider: string) => {
    switch (provider) {
      case "ynab":
        return new YnabOauth2Client(
          `https://app.ynab.com`,
          ynabClientId,
          ynabClientSecret,
          ynabRedirectUri,
          `ynab`,
        );
    }

    throw new Error(`Oauth provider not recognised!`);
  };
