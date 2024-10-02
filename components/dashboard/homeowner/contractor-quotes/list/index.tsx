import type { FC } from 'react';
import { DashboardHomeownerContractorQuotesAccept } from '@/components/dashboard/homeowner/contractor-quotes/accept';
import { DashboardHomeownerContractorQuotesListItems } from '@/components/dashboard/homeowner/contractor-quotes/list/items';
import { TypographyFormTitle } from '@/components/typography/form/title';

export const DashboardHomeownerContractorQuotesList: FC = () => {
  return (
    <div className="flex flex-col items-stretch">
      <div className="h-2" />
      <TypographyFormTitle>
        Contractor Quotes
      </TypographyFormTitle>
      <div className="h-5" />
      <DashboardHomeownerContractorQuotesListItems />
      <div className="h-4" />
      <DashboardHomeownerContractorQuotesAccept />
    </div>
  );
};
