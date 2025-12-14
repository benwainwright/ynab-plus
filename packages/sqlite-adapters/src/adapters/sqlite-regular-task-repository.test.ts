import { ConfigValue, typedApplicationModule } from "@ynab-plus/bootstrap";
import { createRepo, testRegularTasksRepository } from "@ynab-plus/data-adapter-tests";

import { sqliteDataAdaptersModule, type IInternalTypes } from "@core";

const testOverridesModule = typedApplicationModule<IInternalTypes>(({ load }) => {
  load.rebindSync("DatabaseFilename").toConstantValue(new ConfigValue(Promise.resolve(":memory:")));

  load.rebindSync("TasksTableName").toConstantValue(new ConfigValue(Promise.resolve("tasks")));
});

testRegularTasksRepository(() =>
  createRepo("TaskScheduler", sqliteDataAdaptersModule, testOverridesModule),
);
