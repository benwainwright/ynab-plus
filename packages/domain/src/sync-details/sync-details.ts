import { DomainModel } from "@core";
import { syncDetailsSchema, type ISyncDetails } from "./i-sync-details.ts";

export class SyncDetails extends DomainModel<ISyncDetails> implements ISyncDetails {
  public override freezeDry(_config?: { secure: boolean }): {
    id: string;
    provider: string;
    lastSync: Date | undefined;
    checkpoint?: string | undefined;
  } {
    return {
      id: this.id,
      provider: this.provider,
      lastSync: this.lastSync,
      checkpoint: this._checkpoint
    };
  }

  public readonly provider: string;
  public readonly id: string;
  private _checkpoint: string | undefined;
  public readonly lastSync: Date | undefined;

  private constructor(config: ISyncDetails) {
    super();
    this.id = config.id;
    this.provider = config.provider;
    this._checkpoint = config.checkpoint;
    this.lastSync = config.lastSync;
  }

  public static reconstitute(config: ISyncDetails) {
    return new SyncDetails(syncDetailsSchema.parse(config));
  }

  public static create(config: { id: string; provider: string }) {
    const details = new SyncDetails({ ...config, lastSync: undefined });
    details.raiseEvent({ event: "SyncDetailsCreated", data: details });
    return details;
  }

  public get checkpoint(): string | undefined {
    return this._checkpoint;
  }

  public set checkpoint(checkpoint: string | undefined) {
    this._checkpoint = checkpoint;
  }
}
