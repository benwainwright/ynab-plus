import type { BankConnection } from "./bank-connection.ts";

export interface BankConnectionCommands {
  DisconnectBankCoonnectionCommand: {
    request: undefined;
    response: void;
  };
  ListRequisitionAccountsCommand: {
    request: undefined;
    response: {
      name: string | undefined;
      details: string | undefined;
      id: string;
    }[];
  };
  CheckBankConnectionCommand: {
    request: undefined;
    response:
      | {
          status: "new";
          potentialInstitutions: BankConnection[];
        }
      | {
          status: "connected";
          logo: string;
          bankName: string;
          connected: Date;
          refreshed: Date | undefined;
          expires: Date;
        };
  };
  GetInstitutionAuthorizationPageLinkCommand: {
    request: BankConnection;
    response: {
      url: string;
    };
  };
}
