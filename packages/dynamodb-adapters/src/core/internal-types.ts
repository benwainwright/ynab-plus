import type { ConfigValue } from "@ynab-plus/bootstrap";
import type { DyanamoDbSingleTableClient } from "./dynamodb-single-table-client.ts";

export interface IInternalTypes {
  AWSAccountID: ConfigValue<string>;
  AWSAccessKeyId: ConfigValue<string>;
  AWSSecretKey: ConfigValue<string>;
  AWSEndpoint: string | undefined;
  AWSRegion: ConfigValue<string>;
  SingleTableClient: DyanamoDbSingleTableClient;
}
