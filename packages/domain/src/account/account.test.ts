import { Account } from "./account.ts";
describe("the account model", () => {
  describe("freeze dry", () => {
    it("returns an object based on the instance properties", () => {
      const newAccount = Account.reconstitute({
        id: "id",
        userId: "userId",
        name: "account name",
        type: "accont_type",
        closed: false,
        deleted: false,
        balance: 0,
        unclearedBalance: 100,
        clearedBalance: 1000
      });

      const frozen = newAccount.freezeDry();

      expect(frozen).not.toBeInstanceOf(Account);
      expect(frozen).toEqual({
        id: "id",
        userId: "userId",
        name: "account name",
        type: "accont_type",
        closed: false,
        balance: 0,
        unclearedBalance: 100,
        clearedBalance: 1000,
        deleted: false
      });
    });
  });

  it("emits a domain event on create", () => {
    const newAccount = Account.create({
      id: "id",
      userId: "userId",
      name: "account name",
      type: "accont_type",
      closed: false,
      deleted: false,
      clearedBalance: 0,
      balance: 1000,
      unclearedBalance: 10000
    });

    expect(newAccount.pullEvents()).toEqual([
      {
        event: "AccountCreated",
        data: newAccount
      }
    ]);
  });

  it("emits a domain event on delete", () => {
    const newAccount = Account.reconstitute({
      id: "id",
      userId: "userId",
      name: "account name",
      type: "accont_type",
      closed: false,
      clearedBalance: 0,
      balance: 1000,
      unclearedBalance: 10000,
      deleted: false
    });

    newAccount.delete();

    expect(newAccount.pullEvents()).toEqual([
      {
        event: "AccountDeleted",
        data: newAccount
      }
    ]);
  });

  it("allows you to link an account id", () => {
    const newAccount = Account.reconstitute({
      id: "id",
      userId: "userId",
      name: "account name",
      type: "accont_type",
      closed: false,
      clearedBalance: 0,
      balance: 1000,
      unclearedBalance: 10000,
      deleted: false
    });

    newAccount.linkAccount("foo");

    expect(newAccount.pullEvents()).toEqual([
      {
        event: "AccountLinked",
        data: {
          old: Account.reconstitute({
            id: "id",
            userId: "userId",
            name: "account name",
            type: "accont_type",
            closed: false,
            clearedBalance: 0,
            balance: 1000,
            unclearedBalance: 10000,
            deleted: false
          }),
          new: Account.reconstitute({
            id: "id",
            userId: "userId",
            name: "account name",
            type: "accont_type",
            closed: false,
            linkedOpenBankingAccount: "foo",
            clearedBalance: 0,
            balance: 1000,
            unclearedBalance: 10000,
            deleted: false
          })
        }
      }
    ]);

    expect(newAccount.linkedOpenBankingAccount).toEqual("foo");
  });

  it("allows you to update the balances", () => {
    const newAccount = Account.reconstitute({
      id: "id",
      userId: "userId",
      name: "account name",
      type: "accont_type",
      closed: false,
      clearedBalance: 0,
      balance: 1000,
      unclearedBalance: 10000,
      deleted: false
    });

    newAccount.updateBalance({
      balance: 10_000,
      unclearedBalance: 20,
      clearedBalance: 200
    });

    expect(newAccount.pullEvents()).toEqual([
      {
        event: "AccountBalanceUpdated",
        data: {
          old: Account.reconstitute({
            id: "id",
            userId: "userId",
            name: "account name",
            type: "accont_type",
            closed: false,
            clearedBalance: 0,
            balance: 1000,
            unclearedBalance: 10000,
            deleted: false
          }),
          new: Account.reconstitute({
            id: "id",
            userId: "userId",
            name: "account name",
            type: "accont_type",
            closed: false,
            clearedBalance: 200,
            balance: 10_000,
            unclearedBalance: 20,
            deleted: false
          })
        }
      }
    ]);

    expect(newAccount.balance).toEqual(10_000);
    expect(newAccount.clearedBalance).toEqual(200);
    expect(newAccount.unclearedBalance).toEqual(20);
  });
});
