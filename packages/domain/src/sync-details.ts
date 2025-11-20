import type { ISerialisable } from "./i-serialisable.ts";
import { syncDetailsSchema, type ISyncDetails } from "./i-sync-details.ts";

export class SyncDetails
  implements ISyncDetails, ISerialisable<ISyncDetails, "syncDetails">
{
  public readonly provider: string;
  public readonly id: string;
  private _checkpoint: string | undefined;
  public readonly lastSync: Date;

  public readonly $type = "syncDetails";

  public constructor(config: ISyncDetails) {
    this.id = config.id;
    this.provider = config.provider;
    this._checkpoint = config.checkpoint;
    this.lastSync = config.lastSync;
  }

  public get checkpoint(): string | undefined {
    return this._checkpoint;
  }

  public set checkpoint(checkpoint: string | undefined) {
    this._checkpoint = checkpoint;
  }

  public toObject(): ISyncDetails & { $type: "syncDetails" } {
    return {
      $type: "syncDetails",
      id: this.id,
      checkpoint: this.checkpoint,
      provider: this.provider,
      lastSync: this.lastSync,
    };
  }

  public static fromObject(thing: unknown) {
    const data = syncDetailsSchema.parse(thing);
    return new SyncDetails(data);
  }
}
