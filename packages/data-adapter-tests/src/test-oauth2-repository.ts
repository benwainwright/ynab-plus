import type { IDomainEventBuffer, IOauthTokenRepository, IUnitOfWork } from "@ynab-plus/app";
import { OauthToken } from "@ynab-plus/domain";
import type { Mocked } from "vitest";

export const testOauthRepository = (
  create: () => Promise<{
    eventBuffer: Mocked<IDomainEventBuffer>;
    repo: IOauthTokenRepository;
    unitOfWork: IUnitOfWork;
  }>,
) => {
  describe("the token repository", () => {
    it("can update and return a token", async () => {
      const { repo, unitOfWork, eventBuffer } = await create();

      const tokenOne = OauthToken.reconstitute({
        refreshExpiry: undefined,
        provider: "ynab",
        expiry: new Date("2025-12-11T20:39:37.823Z"),
        token: "foo",
        userId: "ben",
        refreshToken: "bar",
        lastUse: new Date("2025-12-10T20:39:37.823Z"),
        refreshed: new Date("2025-07-10T20:39:37.823Z"),
        created: new Date("2025-05-10T20:39:37.823Z"),
      });

      const tokenTwo = OauthToken.reconstitute({
        refreshExpiry: new Date(),
        provider: "monzo",
        userId: "ben",
        expiry: new Date("2025-11-11T20:39:37.823Z"),
        token: "foo-bar",
        refreshToken: "bap",
        lastUse: new Date("2025-12-10T20:39:37.823Z"),
        refreshed: new Date("2025-10-10T20:39:37.823Z"),
        created: new Date("2025-11-10T20:39:37.823Z"),
      });

      await unitOfWork.begin();
      await repo.save(tokenTwo);
      await repo.save(tokenOne);
      expect(eventBuffer.stageEvents).toHaveBeenCalledWith(tokenOne);
      expect(eventBuffer.stageEvents).toHaveBeenCalledWith(tokenTwo);
      await unitOfWork.commit();

      const token = await repo.get("ben", "monzo");

      expect(token).toEqual(tokenTwo);
    });

    it("can delete a token", async () => {
      const { repo, unitOfWork, eventBuffer } = await create();

      const tokenOne = OauthToken.reconstitute({
        refreshExpiry: undefined,
        provider: "ynab",
        expiry: new Date("2025-12-11T20:39:37.823Z"),
        token: "foo",
        userId: "ben",
        refreshToken: "bar",
        lastUse: new Date("2025-12-10T20:39:37.823Z"),
        refreshed: new Date("2025-07-10T20:39:37.823Z"),
        created: new Date("2025-05-10T20:39:37.823Z"),
      });

      const tokenTwo = OauthToken.reconstitute({
        refreshExpiry: new Date(),
        provider: "monzo",
        userId: "ben",
        expiry: new Date("2025-11-11T20:39:37.823Z"),
        token: "foo-bar",
        refreshToken: "bap",
        lastUse: new Date("2025-12-10T20:39:37.823Z"),
        refreshed: new Date("2025-10-10T20:39:37.823Z"),
        created: new Date("2025-11-10T20:39:37.823Z"),
      });

      await unitOfWork.begin();
      await repo.save(tokenTwo);
      await repo.save(tokenOne);
      await unitOfWork.commit();

      eventBuffer.stageEvents.mockReset();

      await unitOfWork.begin();
      await repo.delete(tokenTwo);
      await unitOfWork.commit();
      const token = await repo.get("ben", "monzo");
      const isPresentToken = await repo.get("ben", "ynab");

      expect(token).toBeUndefined();
      expect(isPresentToken).toEqual(tokenOne);
    });
  });
};
