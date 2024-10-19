import { TJobPrices } from '@/types/jobs';
import { isDefined } from '@/utils/validation/is/defined';

export const isUnquoted = (
  userId: string,
  prices?: TJobPrices
) =>
  isDefined(prices) &&
  !prices.some((price) => price.painterId === userId);
