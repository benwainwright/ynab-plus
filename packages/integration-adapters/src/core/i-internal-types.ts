import type { ConfigValue } from "@ynab-plus/bootstrap";

export interface IInternalTypes {
  GocardlessClientSecretIdConfigValue: ConfigValue<string>;
  GocardlessClientSecretKeyConfigValue: ConfigValue<string>;
  GocardlessRedirectUrlConfigValue: ConfigValue<string>;
  TransactionFetcherToken: ConfigValue<string>;
}
