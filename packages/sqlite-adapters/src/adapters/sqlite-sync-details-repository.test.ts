import { ConfigValue, typedApplicationModule } from "@ynab-plus/bootstrap";
import { createRepo, testSyncDetailsRepository } from "@ynab-plus/data-adapter-tests";

import { sqliteDataAdaptersModule, type IInternalTypes } from "@core";

const testOverridesModule = typedApplicationModule<IInternalTypes>(({ load }) => {
  load.rebindSync("DatabaseFilename").toConstantValue(new ConfigValue(Promise.resolve(":memory:")));

  load
    .rebindSync("SyncDetailsTableName")
    .toConstantValue(new ConfigValue(Promise.resolve("syncDetails")));
});

testSyncDetailsRepository(() =>
  createRepo("SyncDetailsRepository", sqliteDataAdaptersModule, testOverridesModule),
);
