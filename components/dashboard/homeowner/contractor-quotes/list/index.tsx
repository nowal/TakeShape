import type { FC } from 'react';
import { DashboardHomeownerContractorQuotesListItems } from '@/components/dashboard/homeowner/contractor-quotes/list/items';
import { TypographyFormTitle } from '@/components/typography/form/title';
import { TCommonIconFC } from '@/components/icon';

type TProps = { Icon: TCommonIconFC };
export const DashboardHomeownerContractorQuotesList: FC<
  TProps
> = ({ Icon }) => {
  return (
    <div className="flex flex-col items-stretch">
      <div className="h-2" />
      <TypographyFormTitle>
        Contractor Quotes
      </TypographyFormTitle>
      <div className="h-5" />
      <DashboardHomeownerContractorQuotesListItems />
      <div className="h-4" />
      <Icon />
    </div>
  );
};
