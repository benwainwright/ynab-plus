import { inject as inversifyInject } from "inversify";
import type {
  TypedInject,
  TypedMultiInject,
} from "@inversifyjs/strongly-typed";

import type { IInternalTypes } from "./i-internal-types.ts";
import type { BootstrapTypes } from "@ynab-plus/bootstrap";
import type { IEntrypointPorts } from "@ynab-plus/app";

export const inject = inversifyInject as TypedInject<
  IEntrypointPorts & IInternalTypes & BootstrapTypes
>;

export const multiInject = inversifyInject as TypedMultiInject<
  IEntrypointPorts & IInternalTypes & BootstrapTypes
>;
