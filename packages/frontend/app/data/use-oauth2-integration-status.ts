import { useEffect, useState } from "react";

import { command } from "./command.ts";

type Oauth2IntegrationStatusConnected = {
  status: "connected";
};

type Oauth2IntegrationStatusNeedsRedirect = {
  status: "not_connected";
  redirectUrl: string;
};

type Oauth2IntegrationStatusLoading = {
  status: "loading";
};

type Oauth2IntegrationStatus =
  | Oauth2IntegrationStatusConnected
  | Oauth2IntegrationStatusLoading
  | Oauth2IntegrationStatusNeedsRedirect;

export const useOauth2IntegrationStatus = (config: { provider: string }) => {
  const [status, setStatus] = useState<Oauth2IntegrationStatus>({
    status: "loading",
  });

  useEffect(() => {
    void (async () => {
      const queryString = new URLSearchParams(window.location.search);
      const code = queryString.get("code");
      if (code) {
        const result = await command("GenerateNewOauthTokenCommand", {
          provider: config.provider,
          code,
        });
        setStatus(result);
      } else {
        setStatus(
          await command("CheckOauthIntegrationStatusCommand", {
            provider: config.provider,
          }),
        );
      }
    })();
  }, []);

  return { status };
};
