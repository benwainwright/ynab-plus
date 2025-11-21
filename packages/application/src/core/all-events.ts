import type { ApplicationEvents } from "@core";
import type { DomainEvents } from "@ynab-plus/domain";

export type AllEvents = DomainEvents & ApplicationEvents;
