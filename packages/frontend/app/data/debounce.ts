export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number,
) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (timeout !== null) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      fn.apply(this, args);
    }, wait);
  };
}
