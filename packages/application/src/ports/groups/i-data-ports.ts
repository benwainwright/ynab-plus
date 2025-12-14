import type {
  IAccountRepository,
  IBankConnectionRepository,
  IDomainEventBuffer,
  IDomainEventStore,
  IMultipleRepository,
  IOauthTokenRepository,
  IRepository,
  ITaskScheduler,
  ITransactionRepository,
  IUnitOfWork,
} from "@ports";

import type { SyncDetails, User } from "@ynab-plus/domain";
import type { ICreatable } from "../i-creatable.ts";

export interface IDataPorts {
  DomainEventBuffer: IDomainEventBuffer;
  DomainEventEmitter: IDomainEventStore;
  UnitOfWork: IUnitOfWork;
  AccountRepository: IAccountRepository;
  UserRepository: IRepository<User> & IMultipleRepository<User>;
  OauthTokenRepository: IOauthTokenRepository;
  TaskScheduler: ITaskScheduler & ICreatable;
  SyncDetailsRepository: IRepository<SyncDetails>;
  TransactionRepository: ITransactionRepository;
  BankConnectionRepository: IBankConnectionRepository;
}
