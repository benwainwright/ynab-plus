import { DomainModel } from "@core";
import type { IBankConnection } from "./i-bank-connection.ts";

export class BankConnection extends DomainModel implements IBankConnection {
  public readonly id: string;
  public readonly userId: string;
  public readonly bankName: string;
  public readonly logo: string;
  private _requisitionId: string | undefined;
  private _token: string | undefined;
  private _refreshToken: string | undefined;
  private _tokenExpiry: Date | undefined;
  private _refreshTokenExpiry: Date | undefined;

  private constructor(config: IBankConnection) {
    super();
    this.id = config.id;
    this.userId = config.userId;
    this.bankName = config.bankName;
    this.logo = config.logo;
    this._requisitionId = config.requisitionId;
    this._token = config.token;
    this._refreshToken = config.refreshToken;
    this._tokenExpiry = config.tokenExpiry;
    this._refreshTokenExpiry = config.refreshTokenExpiry;
  }

  public freezeDry(secure?: boolean): IBankConnection {
    return {
      id: this.id,
      userId: this.userId,
      logo: this.logo,
      bankName: this.bankName,
      requisitionId: this._requisitionId,
      token: secure ? this._token : "",
      refreshToken: secure ? this._refreshToken : "",
      tokenExpiry: this._tokenExpiry,
      refreshTokenExpiry: this._refreshTokenExpiry,
    };
  }

  public static create(config: Omit<IBankConnection, "requisitionId">) {
    const connection = new BankConnection(config);

    connection.raiseEvent({
      event: "BankConnectionCreated",
      data: connection,
    });

    return connection;
  }

  public useToken(): string | undefined {
    return this._token;
  }

  public static reconstite(config: IBankConnection) {
    return new BankConnection(config);
  }

  public saveRequisitionId(id: string) {
    const old = BankConnection.reconstite(this.freezeDry(true));
    this._requisitionId = id;
    this.raiseEvent({
      event: "BankConnectionRequisitionSaved",
      data: { old, new: this },
    });
  }

  public refreshConnection(config: {
    token: string;
    tokenExpiry: Date;
    refreshToken: string;
    refreshTokenExpiry: Date;
  }) {
    const old = BankConnection.reconstite(this.freezeDry(true));
    this._token = config.token;
    this._refreshToken = config.refreshToken;
    this._refreshTokenExpiry = config.refreshTokenExpiry;
    this._tokenExpiry = config.tokenExpiry;
    this.raiseEvent({
      event: "BankConnectionRefreshed",
      data: { old, new: this },
    });
  }
}
