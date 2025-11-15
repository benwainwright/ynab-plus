import { serialisableTypes } from "./serialisable-types.ts";

const isSerialisableTypeKey = (
  type: unknown,
): type is keyof typeof serialisableTypes => {
  return typeof type === "string" && type in serialisableTypes;
};

export const serialiseObject = <TEvents>(data: TEvents[keyof TEvents]) => {
  return serialiseObjectHelper(data);
};

const serialiseObjectHelper = (data: unknown): unknown => {
  if (data && typeof data === "object") {
    if (data instanceof Date) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => serialiseObjectHelper(item));
    }
    if ("$type" in data) {
      const { $type } = data;
      if (isSerialisableTypeKey($type)) {
        if (data instanceof serialisableTypes[$type]) {
          return { ...data.toObject(), $type: $type };
        }
        return data;
      }
    } else {
      return Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          serialiseObjectHelper(value),
        ]),
      );
    }
  }
  return data;
};

export const deSerialiseObject = <TEvents>(data: TEvents[keyof TEvents]) => {
  return deSerialiseObjectHelper(data);
};

const deSerialiseObjectHelper = (data: unknown): unknown => {
  if (data && typeof data === "object") {
    if (data instanceof Date) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => serialiseObjectHelper(item));
    }

    if ("$type" in data) {
      const { $type } = data;
      if (isSerialisableTypeKey($type)) {
        return serialisableTypes[$type].fromObject(data);
      }
      return data;
    } else {
      return Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          serialiseObjectHelper(value),
        ]),
      );
    }
  }
  return data;
};
