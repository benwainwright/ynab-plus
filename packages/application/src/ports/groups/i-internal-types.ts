import type { OpenBankingTokenManager } from "@services";
import type { OauthTokenManager } from "@services/oauth";

export interface IInternalTypes {
  OpenBankingTokenManager: OpenBankingTokenManager;
  OauthManager: OauthTokenManager;
}
