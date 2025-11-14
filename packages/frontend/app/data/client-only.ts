// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const clientOnly = <T extends any[], R>(func: (...args: T) => R) => {
  if (typeof window === "undefined") {
    return () => {};
  }
  return func;
};
