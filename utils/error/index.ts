export const errorFormat = (tail: string) =>
  `Error ${tail}`;
export const errorUpdating = (tail: string) =>
  errorFormat(`updating ${tail}`);
export const errorLoading = (tail: string) =>
  errorFormat(`loading ${tail}`);
export const errorFetching = (tail: string) =>
  errorFormat(`fetching ${tail}`);
