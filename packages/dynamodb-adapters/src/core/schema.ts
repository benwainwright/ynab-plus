export const Schema = {
  version: "0.0.1",
  indexes: {
    primary: { hash: "pk", sort: "sk" }
  },
  models: {
    SyncDetails: {
      pk: { type: String, value: "sync-details: ${id}" },
      sk: { type: String, value: "sync-details:" },
      id: { type: String, required: true },
      provider: { type: String, required: true },
      checkpoint: { type: String },
      lastSync: { type: Date }
    }
  }
} as const;
