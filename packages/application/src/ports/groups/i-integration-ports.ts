import type {
  IAccountsFetcher,
  IBankConnectionCreator,
  IInstitutionAuthPageLinkFetcher,
  IOauthNewTokenRequester,
  IOauthRedirectUrlGenerator,
  IOAuthTokenRefresher,
  ITransactionFetcher,
} from "@ports";
import type { Factory } from "inversify";

export interface IIntegrationPorts {
  AccountsFetcher: IAccountsFetcher;
  TransactionFetcher: ITransactionFetcher;
  BankConnectionCreator: IBankConnectionCreator;
  InstitutionAuthPageLinkFetcher: IInstitutionAuthPageLinkFetcher;
  OauthCheckerFactory: Factory<
    IOauthRedirectUrlGenerator & IOAuthTokenRefresher & IOauthNewTokenRequester
  >;
}
