import { ConfigValue, typedApplicationModule } from "@ynab-plus/bootstrap";
import { createRepo, testTransactionRepository } from "@ynab-plus/data-adapter-tests";

import { sqliteDataAdaptersModule, type IInternalTypes } from "@core";

const testOverridesModule = typedApplicationModule<IInternalTypes>(({ load }) => {
  load.rebindSync("DatabaseFilename").toConstantValue(new ConfigValue(Promise.resolve(":memory:")));

  load
    .rebindSync("TransactionsTableName")
    .toConstantValue(new ConfigValue(Promise.resolve("transactions")));
});

testTransactionRepository(() =>
  createRepo("TransactionRepository", sqliteDataAdaptersModule, testOverridesModule),
);
