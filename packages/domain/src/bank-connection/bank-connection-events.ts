import type { BankConnection } from "./bank-connection.ts";

export interface BankConnectionEvents {
  BankConnectionCreated: BankConnection;
  BankConnectionRequisitionSaved: { old: BankConnection; new: BankConnection };
  BankAccountIdsSaved: { old: BankConnection; new: BankConnection };
  BankConnectionRefreshed: { old: BankConnection; new: BankConnection };
  BankConnectionDeleted: BankConnection;
}
