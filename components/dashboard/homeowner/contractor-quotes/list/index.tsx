import type { FC } from 'react';
import {
  DashboardHomeownerContractorQuotesListItems,
  TDashboardHomeownerContractorQuotesListItemsProps,
} from '@/components/dashboard/homeowner/contractor-quotes/list/items';
import { TCommonIconFC } from '@/components/icon';

type TProps = {
  Icon?: TCommonIconFC;
} & TDashboardHomeownerContractorQuotesListItemsProps;
export const DashboardHomeownerContractorQuotesList: FC<
  TProps
> = ({ Icon, ...props }) => {
  return (
    <div className="flex flex-col items-stretch gap-4">
      <DashboardHomeownerContractorQuotesListItems
        {...props}
      />
      {Icon && <Icon />}
    </div>
  );
};
