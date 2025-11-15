import type { serialisableTypes } from "./serialisable-types.ts";

export interface ISerialisable<
  TTypeShape,
  TTypeName extends keyof typeof serialisableTypes,
> {
  toObject(): Omit<TTypeShape, "toObject"> & { $type: TTypeName };
  readonly $type: TTypeName;
}
