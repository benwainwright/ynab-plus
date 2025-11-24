import type { BankConnection } from "./bank-connection.ts";

export interface BankConnectionCommands {
  CheckBankConnectionCommand: {
    request: undefined;
    response:
      | {
          status: "new";
          potentialInstitutions: BankConnection[];
        }
      | {
          status: "connected";
        };
  };
  GetInstitutionAuthorizationPageLinkCommand: {
    request: BankConnection;
    response: {
      url: string;
    };
  };
}
