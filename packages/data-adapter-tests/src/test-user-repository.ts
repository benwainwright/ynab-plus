import type { IDomainEventBuffer, IRepository } from "@ynab-plus/app";
import { User } from "@ynab-plus/domain";
import type { IMultipleRepository } from "../../application/src/ports/i-multiple-repository.ts";
import type { Mocked } from "vitest";

export const testUserRepository = (
  create: () => Promise<{
    eventBuffer: Mocked<IDomainEventBuffer>;
    repo: IRepository<User> & IMultipleRepository<User>;
    begin: () => Promise<void>;
    commit: () => Promise<void>;
  }>,
) => {
  describe("the user repository", () => {
    it("can delete a user", async () => {
      const { repo, begin, commit, eventBuffer } = await create();

      const data = User.reconstitute({
        email: "bwainwright28@gmail.com",
        id: "ben",
        passwordHash:
          "$argon2id$v=19$m=65536,t=2,p=1$n7G8BcbQsFanGrlBuFB/Y7dedcifW3P7brW8tyMwLsU$9Zdmy6ccSH6ABRNiP6SU+qKE0oYdqu5eexecCKyMDdk",
        permissions: ["user", "public"],
      });

      await begin();
      await repo.save(data);
      expect(eventBuffer.stageEvents).toHaveBeenCalledWith(data);
      await commit();

      eventBuffer.stageEvents.mockReset();
      await begin();
      await repo.delete(data);
      expect(eventBuffer.stageEvents).toHaveBeenCalledWith(data);
      await commit();

      const result = await repo.get("ben");

      expect(result).toEqual(undefined);
    });

    it("can update and return a user", async () => {
      const { repo, begin, commit } = await create();

      const data = User.reconstitute({
        email: "bwainwright28@gmail.com",
        id: "ben",
        passwordHash:
          "$argon2id$v=19$m=65536,t=2,p=1$n7G8BcbQsFanGrlBuFB/Y7dedcifW3P7brW8tyMwLsU$9Zdmy6ccSH6ABRNiP6SU+qKE0oYdqu5eexecCKyMDdk",
        permissions: ["user", "public"],
      });

      await begin();
      await repo.save(data);
      await commit();

      const user = await repo.get(data.id);

      expect(user).toEqual(data);
    });

    describe("getMany", () => {
      it("can return many users", async () => {
        const { repo, begin, commit } = await create();

        const data = User.reconstitute({
          email: "bwainwright28@gmail.com",
          id: "ben",
          passwordHash:
            "$argon2id$v=19$m=65536,t=2,p=1$n7G8BcbQsFanGrlBuFB/Y7dedcifW3P7brW8tyMwLsU$9Zdmy6ccSH6ABRNiP6SU+qKE0oYdqu5eexecCKyMDdk",
          permissions: ["public", "user"],
        });

        const data2 = User.reconstitute({
          email: "a@b.com",
          id: "ben2",
          passwordHash:
            "$argon2id$v=19$m=65536,t=2,p=1$n7G8BcbQsFanGrlBuFB/Y7dedcifW3P7brW8tyMwLsU$9Zdmy6ccSH6ABRNiP6SU+qKE0oYdqu5eexecCKyMDdk",
          permissions: ["public", "user"],
        });

        const data3 = User.reconstitute({
          email: "a@c.com",
          id: "ben3",
          passwordHash:
            "$argon2id$v=19$m=65536,t=2,p=1$n7G8BcbQsFanGrlBuFB/Y7dedcifW3P7brW8tyMwLsU$9Zdmy6ccSH6ABRNiP6SU+qKE0oYdqu5eexecCKyMDdk",
          permissions: ["user"],
        });

        await begin();
        await repo.save(data);
        await repo.save(data2);
        await repo.save(data3);
        await commit();

        const users = await repo.getMany();

        expect(users).toEqual(expect.arrayContaining([data, data2, data3]));
      });
    });

    it("returns undefined if not present", async () => {
      const { repo } = await create();

      const user = await repo.get("foo");

      expect(user).toBeUndefined();
    });
  });
};
