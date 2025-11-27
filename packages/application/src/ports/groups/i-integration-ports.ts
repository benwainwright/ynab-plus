import type {
  IAccountsFetcher,
  IBankConnectionCreator,
  IInstitutionAuthPageLinkFetcher,
  IOauthNewTokenRequester,
  IOauthRedirectUrlGenerator,
  IOAuthTokenRefresher,
} from "@ports";
import type { Factory } from "inversify";

export interface IIntegrationPorts {
  AccountsFetcher: IAccountsFetcher;
  BankConnectionCreator: IBankConnectionCreator;
  InstitutionAuthPageLinkFetcher: IInstitutionAuthPageLinkFetcher;
  OauthCheckerFactory: Factory<
    IOauthRedirectUrlGenerator & IOAuthTokenRefresher & IOauthNewTokenRequester
  >;
}
