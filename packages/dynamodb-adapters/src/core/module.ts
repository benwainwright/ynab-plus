import { typedApplicationModule } from "@ynab-plus/bootstrap";
import { type IDataPorts } from "@ynab-plus/app";

import type { IInternalTypes } from "./internal-types.ts";
import type { TypedContainerModule } from "@inversifyjs/strongly-typed";
import { DyanamoDbSingleTableClient } from "./dynamodb-single-table-client.ts";
import { DynamoDbSyncDetailsRepository } from "@adapters";

export const LOG_CONTEXT = { context: "sqlite-data-adapters-module" };

export const dynamodbDataAdaptersModule: TypedContainerModule<IDataPorts & IInternalTypes> =
  typedApplicationModule<IDataPorts & IInternalTypes>(({ load, logger }) => {
    logger.debug(`Initialising dynamodb data adapters module`, LOG_CONTEXT);

    load.bind("SyncDetailsRepository").to(DynamoDbSyncDetailsRepository);

    load
      .bind("SingleTableClient")
      .to(DyanamoDbSingleTableClient)
      .inSingletonScope()
      .onActivation(async (_context, client) => {
        await client.create();
        return client;
      });

    load.bind("UnitOfWork").toService("SingleTableClient");
  });
