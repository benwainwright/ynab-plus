import { SyncDetails } from "./sync-details.ts";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("sync-details", () => {
  describe("freeze dry", () => {
    it("returns object version of model", () => {
      const details = SyncDetails.reconstitute({
        id: "foo",
        provider: "bar",
        lastSync: new Date(),
        checkpoint: "foo"
      });

      const dried = details.freezeDry();

      expect(dried).not.toBeInstanceOf(SyncDetails);
      expect(dried).toEqual({
        id: "foo",
        provider: "bar",
        lastSync: new Date(),
        checkpoint: "foo"
      });
    });
  });

  describe("the checkpoint property", () => {
    it("raises an event when set", () => {
      const details = SyncDetails.reconstitute({
        id: "foo",
        provider: "bar",
        lastSync: new Date(),
        checkpoint: "foo"
      });

      details.checkpoint = "bar";

      expect(details.pullEvents()).toEqual([
        {
          event: "SyncDetailsNewSyncCheckpointSet",
          data: {
            old: SyncDetails.reconstitute({
              id: "foo",
              provider: "bar",
              lastSync: new Date(),
              checkpoint: "foo"
            }),
            new: SyncDetails.reconstitute({
              id: "foo",
              provider: "bar",
              lastSync: new Date(),
              checkpoint: "bar"
            })
          }
        }
      ]);
    });
  });

  describe("create", () => {
    it("emits a domain event and populates internal data correctly", () => {
      const details = SyncDetails.create({ id: "foo", provider: "ynab" });

      expect(details.checkpoint).toEqual(undefined);
      expect(details.lastSync).toEqual(undefined);
      expect(details.checkpoint).toEqual(undefined);

      expect(details.pullEvents()).toEqual([
        {
          event: "SyncDetailsCreated",
          data: details
        }
      ]);
    });
  });
});
