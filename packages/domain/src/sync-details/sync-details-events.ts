import { SyncDetails } from "./sync-details.ts";

export interface SyncDetailsEvents {
  SyncDetailsCreated: SyncDetails;
  SyncComplete: { old: SyncDetails; new: SyncDetails };
  SyncDetailsDeleted: SyncDetails;
  SyncDetailsNewSyncCheckpointSet: { old: SyncDetails; new: SyncDetails };
}
