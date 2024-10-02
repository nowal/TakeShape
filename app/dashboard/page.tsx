'use client';
import { FC, Suspense } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import { FallbacksLoading } from '@/components/fallbacks/loading';
import { DashboardModalQuoteAccept } from '@/components/dashboard/modal/quote-accept';
import { ComponentsDashboard } from '@/components/dashboard';
import { useDashboard } from '@/context/dashboard/provider';
import { DashboardHomeownerContractorQuotes } from '@/components/dashboard/homeowner/contractor-quotes';
import { DashboardNotificationsQuoteAccepted } from '@/components/dashboard/notifications';
import { ComponentsDashboardShell } from '@/components/dashboard/shell';

const Dashboard = () => {
  const dashboard = useDashboard();
  const {
    isShowModal,
    isPainter,
    painterId,
    selectedQuoteAmount,
    userData,
    acceptedQuote,
    selectedUserImage,
  } = dashboard;
  const isDepositScreen =
    selectedQuoteAmount > 0 && isShowModal;
  return (
    <>
      <GoogleAnalytics gaId="G-47EYLN83WE" />
      <ComponentsDashboardShell
        key="ComponentsDashboardShell"
        first={<ComponentsDashboard />}
        second={
          <>
            {acceptedQuote ? (
              <DashboardNotificationsQuoteAccepted
                painterId={acceptedQuote.painterId}
              />
            ) : (
              <>
                {userData && userData.prices && (
                  <DashboardHomeownerContractorQuotes />
                )}
              </>
            )}
          </>
        }
      >
        <>
          {isDepositScreen && (
            <DashboardModalQuoteAccept
              checkoutButtonProps={{
                selectedQuoteAmount,
                painterId, // Make sure this is the correct painterId
                userImageId: selectedUserImage, // Make sure this is the correct userImageId
                userId: selectedUserImage,
              }}
            />
          )}
        </>
      </ComponentsDashboardShell>
    </>
  );
};

const DashboardWithSuspense: FC = () => (
  <Suspense fallback={<FallbacksLoading />}>
    <Dashboard />
  </Suspense>
);

export default DashboardWithSuspense;
