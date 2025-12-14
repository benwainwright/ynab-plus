import type {
  IAccountsFetcher,
  IBankConnectionCreator,
  IInstitutionAuthPageLinkFetcher,
  IOauthNewTokenRequester,
  IOauthRedirectUrlGenerator,
  IOAuthTokenRefresher,
  IOpenBankingTokenFetcher,
  IRequesitionAccountFetcher,
  ITransactionFetcher,
} from "@ports";
import type { Factory } from "inversify";

export interface IIntegrationPorts {
  AccountsFetcher: IAccountsFetcher;
  TransactionFetcher: ITransactionFetcher;
  BankConnectionTokenFetcher: IOpenBankingTokenFetcher;
  BankConnectionCreator: IBankConnectionCreator;
  RequestionAccountFetcher: IRequesitionAccountFetcher;
  InstitutionAuthPageLinkFetcher: IInstitutionAuthPageLinkFetcher;
  OauthCheckerFactory: Factory<
    IOauthRedirectUrlGenerator & IOAuthTokenRefresher & IOauthNewTokenRequester
  >;
}
