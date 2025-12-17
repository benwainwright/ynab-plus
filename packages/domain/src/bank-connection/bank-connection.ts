import { DomainModel } from "@core";
import type { IBankConnection } from "./i-bank-connection.ts";

export class BankConnection extends DomainModel<IBankConnection> implements IBankConnection {
  public readonly id: string;
  public readonly userId: string;
  public readonly bankName: string;
  public readonly logo: string;
  private _requisitionId: string | undefined;
  private _accounts: string[] | undefined;

  private constructor(config: IBankConnection) {
    super();
    this.id = config.id;
    this.userId = config.userId;
    this.bankName = config.bankName;
    this.logo = config.logo;
    this._requisitionId = config.requisitionId;
    this._accounts = config.accounts;
  }

  public override freezeDry(_config?: { secure: boolean }): IBankConnection {
    return {
      id: this.id,
      userId: this.userId,
      logo: this.logo,
      bankName: this.bankName,
      requisitionId: this._requisitionId,
      accounts: this._accounts
    };
  }

  public static create(config: Omit<IBankConnection, "requisitionId">) {
    const connection = new BankConnection(config);

    connection.raiseEvent({
      event: "BankConnectionCreated",
      data: connection
    });

    return connection;
  }

  public saveAccounts(ids: string[]) {
    const old = BankConnection.reconstite(this.freezeDry({ secure: true }));
    this._accounts = ids;
    this.raiseEvent({
      event: "BankAccountIdsSaved",
      data: { old, new: this }
    });
  }

  public get accounts() {
    return this._accounts;
  }

  public get requisitionId() {
    return this._requisitionId;
  }

  public delete() {
    this.raiseEvent({
      event: "BankConnectionDeleted",
      data: this
    });
  }

  public static reconstite(config: IBankConnection) {
    return new BankConnection(config);
  }

  public saveRequisitionId(id: string) {
    const old = BankConnection.reconstite(this.freezeDry({ secure: true }));
    this._requisitionId = id;
    this.raiseEvent({
      event: "BankConnectionRequisitionSaved",
      data: { old, new: this }
    });
  }
}
