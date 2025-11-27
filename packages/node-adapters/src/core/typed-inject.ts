import { inject as inversifyInject } from "inversify";
import type {
  TypedInject,
  TypedMultiInject,
} from "@inversifyjs/strongly-typed";

import type { IIntegrationPorts } from "@ynab-plus/app";
import type { IInternalTypes } from "./i-internal-types.ts";
import type { BootstrapTypes } from "@ynab-plus/bootstrap";

export const inject = inversifyInject as TypedInject<
  IIntegrationPorts & IInternalTypes & BootstrapTypes
>;

export const multiInject = inversifyInject as TypedMultiInject<
  IIntegrationPorts & IInternalTypes & BootstrapTypes
>;
