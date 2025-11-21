import type { User } from "../index.ts";

export interface UserEvents {
  UserCreated: User;
  UserDeleted: User;
  UserUpdated: { old: User; new: User };
}
