import { ConfigValue, typedApplicationModule } from "@ynab-plus/bootstrap";
import { createRepo, testSyncDetailsRepository } from "@ynab-plus/data-adapter-tests";

import { dynamodbDataAdaptersModule, type IInternalTypes } from "@core";

const testOverridesModule = typedApplicationModule<IInternalTypes>(({ load }) => {
  load.rebindSync("AWSAccessKeyId").toConstantValue(new ConfigValue(Promise.resolve("test")));

  load.rebindSync("AWSSecretKey").toConstantValue(new ConfigValue(Promise.resolve("test")));

  load.rebindSync("AWSAccountID").toConstantValue(new ConfigValue(Promise.resolve("000000000000")));

  load.rebindSync("AWSRegion").toConstantValue(new ConfigValue(Promise.resolve("us-east-1")));

  load.rebindSync("AWSEndpoint").toConstantValue("http://localhost.localstack.cloud:4566");
});

testSyncDetailsRepository(() =>
  createRepo("SyncDetailsRepository", dynamodbDataAdaptersModule, testOverridesModule),
);
