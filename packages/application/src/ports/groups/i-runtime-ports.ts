import type {
  ICurrentUserSetter,
  IEventBus,
  IObjectStorage,
  IPasswordVerifier,
  IPasswordHasher,
  IStringHasher
} from "@ports";

export interface IRuntimePorts {
  EventBus: IEventBus;
  PasswordHasher: IPasswordHasher;
  StringHasher: IStringHasher;
  PasswordVerifier: IPasswordVerifier;
  CurrentUserSetter?: ICurrentUserSetter;
  ObjectStore: IObjectStorage;
}
