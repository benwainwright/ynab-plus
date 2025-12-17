import { inject as inversifyInject } from "inversify";
import type { TypedInject, TypedMultiInject } from "@inversifyjs/strongly-typed";

import type { BootstrapTypes } from "@ynab-plus/bootstrap";
import type { IInternalTypes } from "./i-internal-types.ts";

export const inject = inversifyInject as TypedInject<BootstrapTypes & IInternalTypes>;

export const multiInject = inversifyInject as TypedMultiInject<BootstrapTypes & IInternalTypes>;
