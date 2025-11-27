import type { ServiceIdentifier } from "inversify";
import type { BankConnection } from "node_modules/@ynab-plus/domain/src/bank-connection/bank-connection.ts";
import type { ICreatable } from "./i-creatable.ts";

export interface IBankConnectionRepository extends ICreatable {
  getConnection(userId: string): Promise<BankConnection | undefined>;
  saveConnection(connection: BankConnection): Promise<BankConnection>;
  deleteConnection(connection: BankConnection): Promise<void>;
}

export const BankConnectionRepositoryToken: ServiceIdentifier<IBankConnectionRepository> =
  Symbol.for("BankConnectionRepository");
