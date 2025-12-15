import { inject as inversifyInject, multiInject as inversifyMultiInject } from "inversify";

import type { TypedInject, TypedMultiInject } from "@inversifyjs/strongly-typed";

import type { IApplicationDependencies, IInternalTypes } from "@ports/groups";
import type { BootstrapTypes } from "@ynab-plus/bootstrap";

export const inject = inversifyInject as TypedInject<
  BootstrapTypes & IApplicationDependencies & IInternalTypes
>;

export const multiInject = inversifyMultiInject as TypedMultiInject<
  BootstrapTypes & IApplicationDependencies & IInternalTypes
>;
