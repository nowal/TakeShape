import { TDefined } from "@/types/validation";

export const assertDefined = <T>(
  value: unknown
): asserts value is TDefined<T> => {
  if (typeof value === 'undefined') {
    throw new Error('Variable is undefined!');
  }
};
