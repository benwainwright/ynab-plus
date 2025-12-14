import { ConfigValue, typedApplicationModule } from "@ynab-plus/bootstrap";
import { createRepo, testOauthRepository } from "@ynab-plus/data-adapter-tests";

import { sqliteDataAdaptersModule, type IInternalTypes } from "@core";

const testOverridesModule = typedApplicationModule<IInternalTypes>(({ load }) => {
  load.rebindSync("DatabaseFilename").toConstantValue(new ConfigValue(Promise.resolve(":memory:")));

  load
    .rebindSync("OauthTokenTableName")
    .toConstantValue(new ConfigValue(Promise.resolve("tokens")));
});

testOauthRepository(() =>
  createRepo("OauthTokenRepository", sqliteDataAdaptersModule, testOverridesModule),
);
