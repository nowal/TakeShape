import type { FC } from 'react';
import { DashboardClientQuotesAccept } from '@/components/dashboard/client/quotes/accept';
import { DashboardClientQuotesListItems } from '@/components/dashboard/client/quotes/list/items';

export const DashboardClientQuotesList: FC = () => {
  return (
    <div className="flex flex-col items-stretch">
      <div className="h-2" />
      <h3 className="typography-form-title text-left">
        Contractor Quotes
      </h3>
      <div className="h-5" />
      <DashboardClientQuotesListItems />
      <div className="h-4" />
      <DashboardClientQuotesAccept />
    </div>
  );
};
