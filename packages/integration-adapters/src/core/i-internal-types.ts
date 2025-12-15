import type { HttpClient, IResponseCache } from "@http-client";
import type { ConfigValue } from "@ynab-plus/bootstrap";

export interface IInternalTypes {
  ResponseCache: IResponseCache<unknown>;
  HttpClient: HttpClient;
  GocardlessBaseUrl: string;
  GocardlessClientSecretIdConfigValue: ConfigValue<string>;
  GocardlessClientSecretKeyConfigValue: ConfigValue<string>;
  GocardlessRedirectUrlConfigValue: ConfigValue<string>;
  TransactionFetcherToken: ConfigValue<string>;
}
