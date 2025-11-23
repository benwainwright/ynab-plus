import type { BankConnection } from "./bank-connection.ts";

export interface BankConnectionEvents {
  BankConnectionCreated: BankConnection;
  BankConnectionRefreshed: { old: BankConnection; new: BankConnection };
}
