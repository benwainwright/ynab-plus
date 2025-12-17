import { createRepo, testAccountsRepository } from "@ynab-plus/data-adapter-tests";
import { sqliteDataAdaptersModule, type IInternalTypes } from "@core";
import { ConfigValue, typedApplicationModule } from "@ynab-plus/bootstrap";

const testOverridesModule = typedApplicationModule<IInternalTypes>(({ load }) => {
  load.rebindSync("DatabaseFilename").toConstantValue(new ConfigValue(Promise.resolve(":memory:")));

  load
    .rebindSync("AccountsTableName")
    .toConstantValue(new ConfigValue(Promise.resolve("accounts")));
});

testAccountsRepository(() =>
  createRepo("AccountRepository", sqliteDataAdaptersModule, testOverridesModule)
);
