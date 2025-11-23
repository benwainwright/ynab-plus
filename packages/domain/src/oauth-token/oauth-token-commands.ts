export interface OauthTokenCommands {
  DisconnectOauthIntegrationCommand: {
    request: { provider: string };
    response: undefined;
  };
  GenerateNewOauthTokenCommand: {
    request: {
      provider: string;
      code: string;
    };
    response: {
      status: "connected";
      expiry: Date;
      refreshed: Date | undefined;
      created: Date;
    };
  };
  CheckOauthIntegrationStatusCommand: {
    request: {
      provider: string;
    };
    response:
      | {
          status: "connected";
          expiry: Date;
          refreshed: Date | undefined;
          created: Date;
        }
      | {
          status: "not_connected";
          redirectUrl: string;
        };
  };
}
