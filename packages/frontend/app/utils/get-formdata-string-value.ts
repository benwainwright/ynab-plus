import { FrontendError } from "@errors";

export const getFormDataStringValue = (data: FormData, key: string) => {
  const result = data.get(key);

  if (typeof result !== "string") {
    throw new FrontendError(`Form data was not a string`);
  }

  return result;
};
