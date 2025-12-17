import type {
  IAccountsFetcher,
  IBankConnectionCreator,
  IInstitutionAuthPageLinkFetcher,
  IOauthNewTokenRequester,
  IOauthRedirectUrlGenerator,
  IOAuthTokenRefresher,
  IOpenBankingAccountBalanceFetcher,
  IOpenBankingAccountDetailsFetcher,
  IOpenBankingTokenFetcher,
  IOpenBankingTokenRefresher,
  IRequesitionAccountFetcher,
  ITransactionFetcher
} from "@ports";
import type { Factory } from "inversify";

export interface IIntegrationPorts {
  AccountsFetcher: IAccountsFetcher;
  OpenBankingAccountDetailsFetcher: IOpenBankingAccountDetailsFetcher;
  OpenBankingTokenRefresher: IOpenBankingTokenRefresher;
  TransactionFetcher: ITransactionFetcher;
  BankConnectionTokenFetcher: IOpenBankingTokenFetcher;
  OpenBankingAccountBalanceFetcher: IOpenBankingAccountBalanceFetcher;
  BankConnectionCreator: IBankConnectionCreator;
  RequestionAccountFetcher: IRequesitionAccountFetcher;
  InstitutionAuthPageLinkFetcher: IInstitutionAuthPageLinkFetcher;
  OauthCheckerFactory: Factory<
    IOauthRedirectUrlGenerator & IOAuthTokenRefresher & IOauthNewTokenRequester
  >;
}
