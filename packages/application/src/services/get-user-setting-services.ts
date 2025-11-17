import type {
  ICurrentUserSetter,
  IPasswordHasher,
  IPasswordVerifier,
  IRepository,
} from "@ports";
import { LoginService } from "./auth/login-service.ts";
import { LogoutService } from "./auth/logout-service.ts";
import { RegisterUserService } from "./users/register-user-service.ts";
import type { User } from "@ynab-plus/domain";
import type { ILogger } from "@ynab-plus/bootstrap";
import { GetCurrentUserService } from "./users/get-current-user-service.ts";

interface IUserSettingServiceDependencies {
  userRepository: IRepository<User>;
  passwordVerifier: IPasswordVerifier;
  currentUserSetter?: ICurrentUserSetter;
  passwordHasher: IPasswordHasher;
  logger: ILogger;
}

export const getUserSettingServices = ({
  userRepository,
  passwordVerifier,
  currentUserSetter,
  logger,
  passwordHasher,
}: IUserSettingServiceDependencies) => {
  if (!currentUserSetter) {
    return [];
  }
  return [
    new GetCurrentUserService(userRepository, currentUserSetter, logger),
    new LoginService(
      userRepository,
      passwordVerifier,
      currentUserSetter,
      logger,
    ),
    new LogoutService(currentUserSetter, logger),
    new RegisterUserService(
      userRepository,
      passwordHasher,
      currentUserSetter,
      logger,
    ),
  ];
};
