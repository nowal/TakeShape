import type { FC } from 'react';
import { useDashboard } from '@/context/dashboard/provider';
import { DashboardHomeownerContractorQuotesList } from '@/components/dashboard/homeowner/contractor-quotes/list';
import { DashboardHomeownerContractorQuotesAccept } from '@/components/dashboard/homeowner/contractor-quotes/accept';
import { DashboardHomeownerContractorQuotesEmpty } from '@/components/dashboard/homeowner/contractor-quotes/empty';

export const DashboardHomeownerContractorQuotes: FC =
  () => {
    const dashboard = useDashboard();
    const { userData } = dashboard;

    return (
      <>
        {userData && userData.prices && (
          <DashboardHomeownerContractorQuotesList
            Icon={
              userData.prices.length > 0
                ? DashboardHomeownerContractorQuotesAccept
                : DashboardHomeownerContractorQuotesEmpty
            }
          />
        )}
      </>
    );
  };
