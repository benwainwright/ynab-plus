import type {
  IAccountRepository,
  IMultipleRepository,
  IOauthTokenRepository,
  IRepository,
  ITaskScheduler,
} from "@ports";
import type { SyncDetails, User } from "@ynab-plus/domain";

export interface IDataPorts {
  accountsRepository: IAccountRepository;
  userRepository: IRepository<User> & IMultipleRepository<User>;
  oauthTokenRepository: IOauthTokenRepository;
  taskScheduler: ITaskScheduler;
  syncDetailsRepository: IRepository<SyncDetails>;
}
