import { Transaction } from "./transaction.ts";
describe("the account model", () => {
  it("emits a domain event on create", () => {
    const newTx = Transaction.create({
      id: "foo",
      accountId: "bar",
      amount: 1000,
      payee: "foo",
      cleared: "cleared",
      date: new Date(),
      approved: false,
      memo: "foo",
    });

    expect(newTx.pullEvents()).toEqual([
      {
        event: "TransactionCreated",
        data: newTx,
      },
    ]);
  });

  it("emits a domain event on delete", () => {
    const newTx = Transaction.reconstitute({
      payee: "foo",
      id: "foo",
      accountId: "bar",
      amount: 1000,
      cleared: "cleared",
      date: new Date(),
      approved: false,
      memo: "foo",
    });

    newTx.delete();

    expect(newTx.pullEvents()).toEqual([
      {
        event: "TransactionDeleted",
        data: newTx,
      },
    ]);
  });
});
