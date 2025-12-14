import type { BankConnection } from "./bank-connection.ts";

export interface BankConnectionCommands {
  ListRequisitionAccountsCommand: {
    request: undefined;
    response: {
      created: Date;
      name: string;
      id: string;
      institutionId: string;
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
        };
  };
  GetInstitutionAuthorizationPageLinkCommand: {
    request: BankConnection;
    response: {
      url: string;
    };
  };
}
