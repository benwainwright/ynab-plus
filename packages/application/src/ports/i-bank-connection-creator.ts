import type { BankConnection } from "@ynab-plus/domain";
import type { ServiceIdentifier } from "inversify";

export interface IBankConnectionCreator {
  getConnections(userId: string): Promise<BankConnection[]>;
}

export const BankConnectionCreatorToken: ServiceIdentifier<IBankConnectionCreator> =
  Symbol.for("BankConnectionCreator");
