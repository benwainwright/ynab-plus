import type { IOauthTokenRepository } from "@ynab-plus/app";
import { OauthToken } from "@ynab-plus/domain";

export const testOauthRepository = (
  create: () => Promise<IOauthTokenRepository>,
) => {
  describe("the user repository", () => {
    it("can update and return a user", async () => {
      const repo = await create();

      const tokenOne = OauthToken.reconstitute({
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
        provider: "monzo",
        userId: "ben",
        expiry: new Date("2025-11-11T20:39:37.823Z"),
        token: "foo-bar",
        refreshToken: "bap",
        lastUse: new Date("2025-12-10T20:39:37.823Z"),
        refreshed: new Date("2025-10-10T20:39:37.823Z"),
        created: new Date("2025-11-10T20:39:37.823Z"),
      });

      await repo.save(tokenTwo);
      await repo.save(tokenOne);

      const token = await repo.get("ben", "monzo");

      expect(token).toEqual(tokenTwo);
    });

    it("can delete a token", async () => {
      const repo = await create();

      const tokenOne = OauthToken.reconstitute({
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
        provider: "monzo",
        userId: "ben",
        expiry: new Date("2025-11-11T20:39:37.823Z"),
        token: "foo-bar",
        refreshToken: "bap",
        lastUse: new Date("2025-12-10T20:39:37.823Z"),
        refreshed: new Date("2025-10-10T20:39:37.823Z"),
        created: new Date("2025-11-10T20:39:37.823Z"),
      });

      await repo.save(tokenTwo);
      await repo.save(tokenOne);

      await repo.delete("ben", "monzo");
      const token = await repo.get("ben", "monzo");
      const isPresentToken = await repo.get("ben", "ynab");

      expect(token).toBeUndefined();
      expect(isPresentToken).toEqual(tokenOne);
    });
  });
};
