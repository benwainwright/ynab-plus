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
      });

      const frozen = newAccount.freezeDry();

      expect(frozen).not.toBeInstanceOf(Account);
      expect(frozen).toEqual({
        id: "id",
        userId: "userId",
        name: "account name",
        type: "accont_type",
        closed: false,
        deleted: false,
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
    });

    expect(newAccount.pullEvents()).toEqual([
      {
        event: "AccountCreated",
        data: newAccount,
      },
    ]);
  });

  it("emits a domain event on delete", () => {
    const newAccount = Account.reconstitute({
      id: "id",
      userId: "userId",
      name: "account name",
      type: "accont_type",
      closed: false,
      deleted: false,
    });

    newAccount.delete();

    expect(newAccount.pullEvents()).toEqual([
      {
        event: "AccountDeleted",
        data: newAccount,
      },
    ]);
  });
});
