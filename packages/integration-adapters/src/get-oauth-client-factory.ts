import { YnabOauth2Client } from "@ynab";
import type {
  IOauthNewTokenRequester,
  IOauthRedirectUrlGenerator,
  IOAuthTokenRefresher,
} from "@ynab-plus/app";
import { type IBootstrapper } from "@ynab-plus/bootstrap";
import z from "zod";

export const getOauthClientFactory = (
  bootstrapper: IBootstrapper,
): ((
  provider: string,
) => IOauthRedirectUrlGenerator &
  IOauthNewTokenRequester &
  IOAuthTokenRefresher) => {
  const ynabClientId = bootstrapper.configValue(`ynabClientId`, z.string());

  const ynabClientSecret = bootstrapper.configValue(
    `ynabClientSecret`,
    z.string(),
  );

  const ynabRedirectUri = bootstrapper.configValue(
    `ynabRedirectUri`,
    z.string(),
  );

  return (provider: string) => {
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
};
