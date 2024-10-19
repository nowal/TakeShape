import { JOB_TYPE_TO_PAGE_ROUTE } from '@/components/dashboard/painter/constants';
import { TJobType } from '@/components/dashboard/painter/types';
import { TSelectValue } from '@/components/inputs/types';

export const isQuoteType = (
  value: TSelectValue
): value is TJobType =>
  typeof value === 'string' && value in JOB_TYPE_TO_PAGE_ROUTE;
