import { DEFAULT_MIN_MAX_100 } from '@/components/inputs/constants';
import { ChangeEventHandler } from 'react';
export type TChangeHandler = ChangeEventHandler<HTMLInputElement>;
export type TValueChangeHandler = (
  name: string,
  value: string | number | boolean
) => void;
export type TResolveNumberValue = (value: string) => number;
export type TResolveUnitValue = (
  value: string | number
) => string;
export type TControlledInputProps = {
  name: string;
  value: string;
  onValueChange: TValueChangeHandler;
  resolveValue?(value: number | string): string | number;
  resolveNumberValue?: TResolveNumberValue;
  resolveUnitValue?: TResolveUnitValue;
  inputProps?: Partial<typeof DEFAULT_MIN_MAX_100>;
};
