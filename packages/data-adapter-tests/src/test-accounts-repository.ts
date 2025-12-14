import { type IAccountRepository, type IDomainEventBuffer } from "@ynab-plus/app";
import { Account } from "@ynab-plus/domain";
import { describe, expect, it, type Mocked } from "vitest";

export const testAccountsRepository = (
  create: () => Promise<{
    repo: IAccountRepository;
    eventBuffer: Mocked<IDomainEventBuffer>;
    begin: () => Promise<void>;
    commit: () => Promise<void>;
  }>,
) => {
  describe("the account repository", () => {
    it("can delete accounts", async () => {
      const { repo, begin, commit, eventBuffer } = await create();

      const accountOne = Account.create({
        id: "one",
        userId: "ben",
        name: "hello",
        type: "checking",
        closed: false,
        balance: 1000,
        clearedBalance: 1_000,
        unclearedBalance: 10_000,
        note: "a note",
        deleted: false,
      });

      const accountTwo = Account.create({
        id: "two",
        userId: "ben",
        name: "hello",
        type: "checking",
        closed: false,
        balance: 1000,
        clearedBalance: 1_000,
        unclearedBalance: 10_000,
        note: "a note",
        deleted: false,
      });

      await begin();
      await repo.saveAccounts([accountOne, accountTwo]);
      expect(eventBuffer.stageEvents).toHaveBeenCalledWith(accountOne);
      expect(eventBuffer.stageEvents).toHaveBeenCalledWith(accountTwo);

      await commit();

      eventBuffer.stageEvents.mockReset();

      await begin();
      await repo.deleteAccount(accountOne);
      expect(eventBuffer.stageEvents).toHaveBeenCalledWith(accountOne);
      await commit();

      const result = await repo.getAccounts("one");

      expect(result).toBeUndefined();
    });

    it("can save multiple users", async () => {
      const { repo, begin, commit } = await create();

      const accountOne = Account.reconstitute({
        id: "one",
        userId: "ben",
        name: "hello",
        type: "checking",
        closed: false,
        note: "a note",
        deleted: false,
        balance: 1000,
        clearedBalance: 1_000,
        unclearedBalance: 10_000,
      });

      const accountTwo = Account.reconstitute({
        id: "two",
        userId: "ben",
        name: "hello",
        type: "checking",
        closed: false,
        balance: 1000,
        clearedBalance: 1_000,
        unclearedBalance: 10_000,
        note: "a note",
        deleted: false,
      });

      await begin();
      await repo.saveAccounts([accountOne, accountTwo]);
      await commit();

      const accounts = await repo.getUserAccounts("ben");
      expect(accounts).toEqual(expect.arrayContaining([accountOne, accountTwo]));
    });
    it("can update and return an account", async () => {
      const { repo, begin, commit } = await create();

      const accountOne = Account.reconstitute({
        id: "one",
        userId: "ben",
        name: "hello",
        type: "checking",
        closed: false,
        balance: 1000,
        clearedBalance: 1_000,
        unclearedBalance: 10_000,
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
        balance: 1000,
        clearedBalance: 1_000,
        unclearedBalance: 10_000,
        deleted: false,
      });

      await begin();
      await repo.saveAccount(accountOne);
      await repo.saveAccount(accountTwo);
      await commit();

      const token = await repo.getAccounts("two");

      expect(token).toEqual(accountTwo);
    });

    it("can return all of the current accounts for a user", async () => {
      const { repo, begin, commit } = await create();

      const accountOne = Account.reconstitute({
        id: "one",
        userId: "ben",
        name: "hello",
        type: "checking",
        linkedOpenBankingAccount: "foo",
        closed: false,
        balance: 1000,
        clearedBalance: 1_000,
        unclearedBalance: 10_000,
        note: "a note",
        deleted: false,
      });

      const accountTwo = Account.reconstitute({
        balance: 1000,
        clearedBalance: 1_000,
        unclearedBalance: 10_000,
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
        balance: 1000,
        clearedBalance: 1_000,
        unclearedBalance: 10_000,
        closed: false,
        note: "a note",
        deleted: false,
      });

      await begin();
      await repo.saveAccount(accountOne);
      await repo.saveAccount(accountTwo);
      await repo.saveAccount(accountThree);
      await commit();

      const accounts = await repo.getUserAccounts("ben");

      expect(accounts).toHaveLength(2);
      expect(accounts).toEqual(expect.arrayContaining([accountOne, accountTwo]));
    });
  });
};
