import type { FC } from 'react';
import { DashboardNotificationsQuoteAccepted } from '@/components/dashboard/notifications';
import { useDashboard } from '@/context/dashboard/provider';
import { DashboardClientQuotesList } from '@/components/dashboard/client/quotes/list';

export const DashboardClientQuotes: FC = () => {
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
        <DashboardClientQuotesList />
      )}
    </>
  );
};
