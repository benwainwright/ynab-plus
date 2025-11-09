export const delay = (seconds: number) =>
  new Promise((accept) => setTimeout(accept, seconds * 1000));
