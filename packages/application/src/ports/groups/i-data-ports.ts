import type {
  IAccountRepository,
  IBankConnectionRepository,
  IMultipleRepository,
  IOauthTokenRepository,
  IRepository,
  ITaskScheduler,
  ITransactionRepository,
} from "@ports";

import type { SyncDetails, User } from "@ynab-plus/domain";
import type { ICreatable } from "../i-creatable.ts";

export interface IDataPorts {
  AccountRepository: IAccountRepository;
  UserRepository: IRepository<User> & IMultipleRepository<User>;
  OauthTokenRepository: IOauthTokenRepository;
  TaskScheduler: ITaskScheduler & ICreatable;
  SyncDetailsRepository: IRepository<SyncDetails>;
  TransactionRepository: ITransactionRepository;
  BankConnectionRepository: IBankConnectionRepository;
}
