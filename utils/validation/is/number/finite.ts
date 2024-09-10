import { isNumber } from "@/utils/validation/is/number";

export const isNumberFinite = (value?: unknown | number): value is number => {
  if (isNumber(value) && isFinite(value)) return true;
  return false;
};
