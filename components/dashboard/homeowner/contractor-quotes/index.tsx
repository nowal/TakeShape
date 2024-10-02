import type { FC } from 'react';
import { DashboardNotificationsQuoteAccepted } from '@/components/dashboard/notifications';
import { useDashboard } from '@/context/dashboard/provider';
import { DashboardHomeownerContractorQuotesList } from '@/components/dashboard/homeowner/contractor-quotes/list';

export const DashboardHomeownerContractorQuotes: FC =
  () => {
    const dashboard = useDashboard();
    const { userData, acceptedQuote } = dashboard;

    if (acceptedQuote) {
      return (
        <DashboardNotificationsQuoteAccepted
          painterId={acceptedQuote.painterId}
        />
      );
    }
    return (
      <>
        {userData && userData.prices && (
          <DashboardHomeownerContractorQuotesList />
        )}
      </>
    );
  };
