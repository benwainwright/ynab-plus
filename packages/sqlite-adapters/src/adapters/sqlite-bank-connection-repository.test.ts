import { createRepo, testBankConnectionRepository } from "@ynab-plus/data-adapter-tests";
import { ConfigValue, typedApplicationModule } from "@ynab-plus/bootstrap";
import { sqliteDataAdaptersModule, type IInternalTypes } from "@core";

const testOverridesModule = typedApplicationModule<IInternalTypes>(({ load }) => {
  load.rebindSync("DatabaseFilename").toConstantValue(new ConfigValue(Promise.resolve(":memory:")));

  load
    .rebindSync("BankConnectionTableName")
    .toConstantValue(new ConfigValue(Promise.resolve("bankConnections")));
});

testBankConnectionRepository(() =>
  createRepo("BankConnectionRepository", sqliteDataAdaptersModule, testOverridesModule)
);
