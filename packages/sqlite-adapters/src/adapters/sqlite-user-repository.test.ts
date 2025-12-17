import { ConfigValue, typedApplicationModule } from "@ynab-plus/bootstrap";
import { createRepo, testUserRepository } from "@ynab-plus/data-adapter-tests";

import { sqliteDataAdaptersModule, type IInternalTypes } from "@core";

const testOverridesModule = typedApplicationModule<IInternalTypes>(({ load }) => {
  load.rebindSync("DatabaseFilename").toConstantValue(new ConfigValue(Promise.resolve(":memory:")));

  load.rebindSync("UsersTableName").toConstantValue(new ConfigValue(Promise.resolve("users")));
});

testUserRepository(() =>
  createRepo("UserRepository", sqliteDataAdaptersModule, testOverridesModule)
);
