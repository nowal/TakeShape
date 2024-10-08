import type { FC } from 'react';
import { cx } from 'class-variance-authority';
import { TCommonIconFC } from '@/components/icon';

export type TDashboardHomeownerContractorQuotesBaseProps = {
  Icon: TCommonIconFC;
  long: string;
};
export const DashboardHomeownerContractorQuotesBase: FC<
  TDashboardHomeownerContractorQuotesBaseProps
> = ({ Icon, long }) => {
  return (
    <div
      className={cx(
        'flex flex-row items-center gap-3.5 text-xs font-medium text-gray-7',
        'px-5',
        'py-4',
        'border',
        'border-gray-11',
        'rounded-lg'
      )}
    >
      <Icon />
      <span>{long}</span>
    </div>
  );
};
