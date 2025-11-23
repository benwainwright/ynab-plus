import { type IEventBus, type IRepository } from "@ports";
import { emitDomainEventsOnSave } from "./emit-domain-events-on-save.ts";
import { SyncDetails, type DomainEvents } from "@ynab-plus/domain";
import { mock } from "vitest-mock-extended";

describe("repo with event emitting", () => {
  it("causes domain events to be emitted on the event the method is called with a domain model", async () => {
    let theDetails: SyncDetails | undefined;

    class MockRepo implements IRepository<SyncDetails> {
      // eslint-disable-next-line @typescript-eslint/require-await
      async get(_theID: string): Promise<SyncDetails | undefined> {
        return undefined;
      }

      // eslint-disable-next-line @typescript-eslint/require-await
      async save(thing: SyncDetails): Promise<SyncDetails> {
        theDetails = thing;
        return thing;
      }

      // eslint-disable-next-line @typescript-eslint/require-await
      async delete(_thing: SyncDetails): Promise<void> {
        throw new Error("Method not implemented.");
      }
    }

    const mockRepo = new MockRepo();

    const eventBus = mock<IEventBus<DomainEvents>>();

    const repo = emitDomainEventsOnSave(mockRepo, eventBus, "save");

    const details = SyncDetails.create({ id: "foo", provider: "ynab" });

    const result = await repo.save(details);
    const getResult = await repo.get("foo");

    expect(eventBus.emit).toHaveBeenCalledWith("SyncDetailsCreated", details);
    expect(result).toEqual(details);
    expect(details).toEqual(theDetails);
    expect(getResult).toEqual(undefined);
  });
});
