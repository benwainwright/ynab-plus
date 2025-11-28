import type { User } from "@ynab-plus/domain";

export interface ICurrentUserSetter {
  set(user: User | undefined): Promise<void>;
}
