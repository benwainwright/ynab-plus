import type {
  ICurrentUserSetter,
  IEventBus,
  IObjectStorage,
  IPasswordVerifier,
  IStringHasher,
} from "@ports";

export interface IRuntimePorts {
  EventBus: IEventBus;
  StringHasher: IStringHasher;
  PasswordVerifier: IPasswordVerifier;
  CurrentUserSetter?: ICurrentUserSetter;
  SessionStoreObjectStore: IObjectStorage;
}
