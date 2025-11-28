import type { BankConnection } from "@ynab-plus/domain";
import type { ICreatable } from "./i-creatable.ts";

export interface IBankConnectionRepository extends ICreatable {
  getConnection(userId: string): Promise<BankConnection | undefined>;
  saveConnection(connection: BankConnection): Promise<BankConnection>;
  deleteConnection(connection: BankConnection): Promise<void>;
}
