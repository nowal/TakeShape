import type { FC } from 'react';
import { useDashboard } from '@/context/dashboard/provider';
import { DashboardHomeownerContractorQuotesList } from '@/components/dashboard/homeowner/contractor-quotes/list';

export const DashboardHomeownerContractorQuotes: FC =
  () => {
    const dashboard = useDashboard();
    const { userData, acceptedQuote } = dashboard;

    return (
      <>
        {userData && userData.prices && (
          <DashboardHomeownerContractorQuotesList />
        )}
      </>
    );
  };
