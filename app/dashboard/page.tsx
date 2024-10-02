'use client';
import { FC, Suspense } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import { FallbacksLoading } from '@/components/fallbacks/loading';
import { DashboardModalQuoteAccept } from '@/components/dashboard/modal/quote-accept';
import { ComponentsDashboard } from '@/components/dashboard';
import { useDashboard } from '@/context/dashboard/provider';
import { DashboardHomeownerContractorQuotes } from '@/components/dashboard/homeowner/contractor-quotes';
import { DashboardNotificationsQuoteAccepted } from '@/components/dashboard/_prev-quote-accepted';
import { ComponentsDashboardShell } from '@/components/dashboard/shell';
import { ComponentsCongrats } from '@/components/congrats';
import { ComponentsCongratsPanel } from '@/components/congrats/panel';

const Dashboard = () => {
  const dashboard = useDashboard();
  const {
    isShowModal,
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
              <>
                <ComponentsCongratsPanel />
              </>
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
