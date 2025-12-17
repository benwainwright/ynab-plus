import { useEffect, useState } from "react";

import { command } from "./command.ts";
import { useEvent } from "./use-event.ts";
import { useSearchParams } from "react-router";

export type Oauth2IntegrationStatusConnected = {
  status: "connected";
  expiry: Date;
  refreshed: Date | undefined;
  created: Date;
};

export type Oauth2IntegrationStatusNeedsRedirect = {
  status: "not_connected";
  redirectUrl: string;
};

export type Oauth2IntegrationStatusLoading = {
  status: "loading";
};

export type Oauth2IntegrationStatus =
  | Oauth2IntegrationStatusConnected
  | Oauth2IntegrationStatusLoading
  | Oauth2IntegrationStatusNeedsRedirect;

export const useOauth2IntegrationStatus = (config: { provider: string }) => {
  const [dirty, setDirty] = useState(true);
  const [status, setStatus] = useState<Oauth2IntegrationStatus>({
    status: "loading"
  });

  useEvent("OauthIntegrationDisconnected", () => {
    setDirty(true);
  });

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    void (async () => {
      if (dirty) {
        const code = searchParams.get("code");
        if (code) {
          const result = await command("GenerateNewOauthTokenCommand", {
            provider: config.provider,
            code
          });

          setStatus(result);
          searchParams.delete("code");
          setSearchParams(searchParams);
        } else {
          setStatus(
            await command("CheckOauthIntegrationStatusCommand", {
              provider: config.provider
            })
          );
        }
        setDirty(false);
      }
    })();
  }, [dirty]);

  return { status };
};
