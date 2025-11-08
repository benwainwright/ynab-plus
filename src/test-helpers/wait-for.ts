const waitMilliseconds = (milliseconds: number) => {
  return new Promise((accept) => setTimeout(accept, milliseconds));
};

export const waitFor = async (
  callback: () => unknown,
  opts?: {
    timeout?: number;
    interval?: number;
  },
) => {
  const theOpts = opts ?? {};
  const timeout = theOpts.timeout ?? 5_000;
  const interval = theOpts.interval ?? 20;

  await waitForHelper(callback, { timeout, interval }, Date.now());
};

const waitForHelper = async (
  callback: () => unknown,

  opts: {
    interval: number;
    timeout: number;
  },
  start: number,
) => {
  try {
    await callback();
  } catch {
    if (Date.now() < start + opts.timeout) {
      await waitMilliseconds(opts.interval);
      await waitForHelper(callback, opts, start);
    }
  }
};
