import { BankConnection } from "./bank-connection.ts";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("the bank connection", () => {
  describe("reconstitute", () => {
    it("creates a hydrated bank connection without emitting any events", () => {
      const tokenExpiry = new Date();
      const refreshTokenExpiry = new Date();
      const connection = BankConnection.reconstite({
        bankName: "foo",
        id: "foo",
        userId: "ben",
        logo: "bar",
        requisitionId: "baz",
        token: "token",
        refreshToken: "refreshToken",
        tokenExpiry,
        refreshTokenExpiry,
      });

      expect(connection.bankName).toEqual("foo");
      expect(connection.logo).toEqual("bar");
      expect(connection.requisitionId).toEqual("baz");
      expect(connection.freezeDry(true).token).toEqual("token");
      expect(connection.freezeDry(true).refreshToken).toEqual("refreshToken");
      expect(connection.freezeDry().tokenExpiry).toEqual(tokenExpiry);
      expect(connection.freezeDry().refreshTokenExpiry).toEqual(
        refreshTokenExpiry,
      );
      expect(connection.pullEvents()).toEqual([]);
    });
  });

  describe("create", () => {
    it("creates a bank connection and emits an event", () => {
      const connection = BankConnection.create({
        id: "foo",
        userId: "ben",
        bankName: "foo",
        logo: "bar",
        token: "theToken",
        refreshToken: "refreshToken",
      });

      expect(connection.bankName).toEqual("foo");
      expect(connection.logo).toEqual("bar");
      expect(connection.requisitionId).toEqual(undefined);
      expect(connection.freezeDry(true).token).toEqual("theToken");
      expect(connection.freezeDry(true).refreshToken).toEqual("refreshToken");

      expect(connection.pullEvents()).toEqual([
        {
          event: "BankConnectionCreated",
          data: connection,
        },
      ]);
    });
  });

  it("refreshConnection", () => {
    vi.setSystemTime(new Date("2024-11-11T20:39:37.823Z"));

    const tokenExpiry = new Date("2026-11-11T20:39:37.823Z");
    const refreshTokenExpiry = new Date("2027-11-11T20:39:37.823Z");
    const newTokenExpiry = new Date("2028-11-11T20:39:37.823Z");
    const newRefreshTokenExpiry = new Date("2028-11-11T20:39:37.823Z");

    const connection = BankConnection.reconstite({
      id: "foo",
      userId: "ben",
      bankName: "foo",
      logo: "bar",
      requisitionId: "baz",
      token: "token",
      refreshToken: "refreshToken",
      tokenExpiry,
      refreshTokenExpiry,
    });

    connection.refreshConnection({
      token: "new-token",
      tokenExpiry: newTokenExpiry,
      refreshToken: "new-refresh",
      refreshTokenExpiry: newRefreshTokenExpiry,
    });

    expect(connection.freezeDry(true).token).toEqual("new-token");
    expect(connection.freezeDry(true).refreshToken).toEqual("new-refresh");
    expect(connection.freezeDry().tokenExpiry).toEqual(newTokenExpiry);
    expect(connection.freezeDry().refreshTokenExpiry).toEqual(
      newRefreshTokenExpiry,
    );

    expect(connection.pullEvents()).toEqual([
      {
        event: "BankConnectionRefreshed",
        data: {
          old: BankConnection.reconstite({
            id: "foo",
            userId: "ben",
            bankName: "foo",
            logo: "bar",
            requisitionId: "baz",
            token: "token",
            refreshToken: "refreshToken",
            tokenExpiry,
            refreshTokenExpiry,
          }),
          new: BankConnection.reconstite({
            id: "foo",
            userId: "ben",
            bankName: "foo",
            logo: "bar",
            requisitionId: "baz",
            token: "new-token",
            refreshToken: "new-refresh",
            tokenExpiry: newTokenExpiry,
            refreshTokenExpiry: newRefreshTokenExpiry,
          }),
        },
      },
    ]);
  });
});
