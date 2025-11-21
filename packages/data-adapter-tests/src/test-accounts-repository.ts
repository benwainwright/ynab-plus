import { type IAccountRepository } from "@ynab-plus/app";
import { Account } from "@ynab-plus/domain";
import { describe, expect, it } from "vitest";

export const testAccountsRepository = (
  create: () => Promise<IAccountRepository>,
) => {
  describe("the account repository", () => {
    it("can delete accounts", async () => {
      const repo = await create();

      const accountOne = Account.reconstitute({
        id: "one",
        userId: "ben",
        name: "hello",
        type: "checking",
        closed: false,
        note: "a note",
        deleted: false,
      });

      const accountTwo = Account.reconstitute({
        id: "two",
        userId: "ben",
        name: "hello",
        type: "checking",
        closed: false,
        note: "a note",
        deleted: false,
      });

      await repo.saveAccounts([accountOne, accountTwo]);

      await repo.deleteAccount(accountOne);

      const result = await repo.getAccounts("one");

      expect(result).toBeUndefined();
    });

    it("can save multiple users", async () => {
      const repo = await create();

      const accountOne = Account.reconstitute({
        id: "one",
        userId: "ben",
        name: "hello",
        type: "checking",
        closed: false,
        note: "a note",
        deleted: false,
      });

      const accountTwo = Account.reconstitute({
        id: "two",
        userId: "ben",
        name: "hello",
        type: "checking",
        closed: false,
        note: "a note",
        deleted: false,
      });

      await repo.saveAccounts([accountOne, accountTwo]);

      const accounts = await repo.getUserAccounts("ben");

      expect(accounts[0]).toEqual(accountOne);
      expect(accounts[1]).toEqual(accountTwo);
    });
    it("can update and return an account", async () => {
      const repo = await create();

      const accountOne = Account.reconstitute({
        id: "one",
        userId: "ben",
        name: "hello",
        type: "checking",
        closed: false,
        note: "a note",
        deleted: false,
      });

      const accountTwo = Account.reconstitute({
        id: "two",
        userId: "ben",
        name: "hello",
        type: "checking",
        closed: false,
        note: "a note",
        deleted: false,
      });

      await repo.saveAccount(accountOne);
      await repo.saveAccount(accountTwo);

      const token = await repo.getAccounts("two");

      expect(token).toEqual(accountTwo);
    });

    it("can return all of the current accounts for a user", async () => {
      const repo = await create();

      const accountOne = Account.reconstitute({
        id: "one",
        userId: "ben",
        name: "hello",
        type: "checking",
        closed: false,
        note: "a note",
        deleted: false,
      });

      const accountTwo = Account.reconstitute({
        id: "two",
        userId: "ben",
        name: "hello",
        type: "checking",
        closed: false,
        note: "a note",
        deleted: false,
      });

      const accountThree = Account.reconstitute({
        id: "three",
        userId: "fred",
        name: "hello",
        type: "checking",
        closed: false,
        note: "a note",
        deleted: false,
      });

      await repo.saveAccount(accountOne);
      await repo.saveAccount(accountTwo);
      await repo.saveAccount(accountThree);

      const accounts = await repo.getUserAccounts("ben");

      expect(accounts).toHaveLength(2);
      expect(accounts[0]).toEqual(accountOne);
      expect(accounts[1]).toEqual(accountTwo);
    });
  });
};
