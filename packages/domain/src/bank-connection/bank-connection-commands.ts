import type { BankConnection } from "./bank-connection.ts";

export interface BankConnectionCommands {
  ListRequisitionAccountsCommand: {
    request: undefined;
    response: {
      name: string | undefined;
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
