export interface UserEvents {
  RegisterSuccess: undefined;
  RegisterFail: { reason: string };
  UserUpdateFail: { reason: string };
}
