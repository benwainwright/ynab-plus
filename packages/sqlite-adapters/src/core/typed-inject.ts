import { inject as inversifyInject } from "inversify";
import type {
  TypedInject,
  TypedMultiInject,
} from "@inversifyjs/strongly-typed";

import type { IDataPorts } from "@ynab-plus/app";
import type { IInternalTypes } from "./internal-types.ts";

export const inject = inversifyInject as TypedInject<
  IDataPorts & IInternalTypes
>;

export const multiInject = inversifyInject as TypedMultiInject<
  IDataPorts & IInternalTypes
>;
