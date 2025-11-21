import { SyncDetails } from "./sync-details.ts";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("sync-details", () => {
  describe("create", () => {
    it("emits a domain event and populates internal data correctly", () => {
      const details = SyncDetails.create({ id: "foo", provider: "ynab" });

      expect(details.checkpoint).toEqual(undefined);
      expect(details.lastSync).toEqual(undefined);
      expect(details.checkpoint).toEqual(undefined);

      expect(details.pullEvents()).toEqual([
        {
          event: "SyncDetailsCreated",
          data: details,
        },
      ]);
    });
  });
});
