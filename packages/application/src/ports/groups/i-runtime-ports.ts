import type {
  ICurrentUserSetter,
  IEventBus,
  IObjectStorage,
  IPasswordHasher,
  IPasswordVerifier,
} from "@ports";

export interface IRuntimePorts {
  EventBus: IEventBus;
  PasswordHasher: IPasswordHasher;
  PasswordVerifier: IPasswordVerifier;
  CurrentUserSetter?: ICurrentUserSetter;
  SessionStoreObjectStore: IObjectStorage;
}
