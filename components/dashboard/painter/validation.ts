import { QUOTE_KEYS } from '@/components/dashboard/painter/constants';
import { TQuoteKey } from '@/components/dashboard/painter/types';
import { TSelectValue } from '@/components/inputs/types';

export const isQuoteType = (
  value: TSelectValue
): value is TQuoteKey =>
  typeof value === 'string' && value in QUOTE_KEYS;
