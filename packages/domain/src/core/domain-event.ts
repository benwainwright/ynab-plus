import type { AccountEvents } from "@account";
import type { RegularTaskEvents } from "@regular-task";
import type { OauthTokenEvents } from "@oauth-token";
import type { SyncDetailsEvents } from "@sync-details";
import type { TransactionEvents } from "@transaction";
import type { BankConnectionEvents } from "@bank-connection";
import type { UserEvents } from "@user";

export type DomainEvents = UserEvents &
  AccountEvents &
  RegularTaskEvents &
  SyncDetailsEvents &
  TransactionEvents &
  OauthTokenEvents &
  BankConnectionEvents;

export type DomainEvent<TKey extends keyof DomainEvents = keyof DomainEvents> =
  TKey extends keyof DomainEvents ? { event: TKey; data: DomainEvents[TKey] } : never;
