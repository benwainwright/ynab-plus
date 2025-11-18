import type { ISerialisable } from "./i-serialisable.ts";
import { syncDetailsSchema, type ISyncDetails } from "./i-sync-details.ts";

export class SyncDetails
  implements ISyncDetails, ISerialisable<ISyncDetails, "syncDetails">
{
  public readonly provider: string;
  public readonly id: string;
  public readonly checkpoint: string | undefined;
  public readonly lastSync: Date;

  public readonly $type = "syncDetails";

  public constructor(config: ISyncDetails) {
    this.id = config.id;
    this.provider = config.provider;
    this.checkpoint = config.checkpoint;
    this.lastSync = config.lastSync;
  }

  public toObject(): ISyncDetails & { $type: "syncDetails" } {
    return this;
  }

  public static fromObject(thing: unknown) {
    const data = syncDetailsSchema.parse(thing);
    return new SyncDetails(data);
  }
}
