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
      const connection = BankConnection.reconstite({
        bankName: "foo",
        id: "foo",
        userId: "ben",
        logo: "bar",
        requisitionId: "baz",
      });

      expect(connection.bankName).toEqual("foo");
      expect(connection.logo).toEqual("bar");
      expect(connection.freezeDry().requisitionId).toEqual("baz");
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
      });

      expect(connection.bankName).toEqual("foo");
      expect(connection.logo).toEqual("bar");
      expect(connection.freezeDry().requisitionId).toEqual(undefined);

      expect(connection.pullEvents()).toEqual([
        {
          event: "BankConnectionCreated",
          data: connection,
        },
      ]);
    });
  });

  describe("save account ids", () => {
    it("saves the account id and raises the correct event", () => {
      const connection = BankConnection.reconstite({
        id: "foo",
        userId: "ben",
        bankName: "foo",
        logo: "bar",
      });

      connection.saveAccounts(["foo", "bar"]);

      expect(connection.freezeDry().accounts).toEqual(["foo", "bar"]);

      expect(connection.pullEvents()).toEqual([
        {
          event: "BankAccountIdsSaved",
          data: {
            old: BankConnection.reconstite({
              id: "foo",
              userId: "ben",
              bankName: "foo",
              logo: "bar",
            }),
            new: BankConnection.reconstite({
              id: "foo",
              userId: "ben",
              bankName: "foo",
              accounts: ["foo", "bar"],
              logo: "bar",
            }),
          },
        },
      ]);
    });
  });

  describe("save requisition id", () => {
    it("saves the req id and raises the correct event", () => {
      const connection = BankConnection.reconstite({
        id: "foo",
        userId: "ben",
        bankName: "foo",
        logo: "bar",
      });

      connection.saveRequisitionId("foo");

      expect(connection.freezeDry().requisitionId).toEqual("foo");

      expect(connection.pullEvents()).toEqual([
        {
          event: "BankConnectionRequisitionSaved",
          data: {
            old: BankConnection.reconstite({
              id: "foo",
              userId: "ben",
              bankName: "foo",
              logo: "bar",
            }),
            new: BankConnection.reconstite({
              id: "foo",
              userId: "ben",
              bankName: "foo",
              requisitionId: "foo",
              logo: "bar",
            }),
          },
        },
      ]);
    });
  });
});
