'use client';
import { FC, Suspense } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import { FallbacksLoading } from '@/components/fallbacks/loading';
import { DashboardModalQuoteAccepted } from '@/components/dashboard/modal/quote-accepted';
import { ComponentsDashboard } from '@/components/dashboard';
import { cx } from 'class-variance-authority';
import {
  DASHBOARD_GAP,
  DASHBOARD_WIDTH,
  DASHBOARD_WIDTH_LEFT,
  DASHBOARD_WIDTH_RIGHT,
} from '@/components/dashboard/constants';
import { useDashboard } from '@/context/dashboard/provider';
import { DashboardClientQuotes } from '@/components/dashboard/client/quotes';
import { DashboardNotificationsQuoteAccepted } from '@/components/dashboard/notifications';
import { useViewport } from '@/context/viewport';

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
    dispatchShowModal,
  } = dashboard;
  const handleCloseModal = () => dispatchShowModal(false);
  const viewport = useViewport();
  const isLg = viewport.isDimensions && viewport.isLg;
  const isXs = viewport.isDimensions && viewport.isXs;
  const largeWidth =
    DASHBOARD_WIDTH_LEFT + DASHBOARD_GAP / 2;
  // console.log('acceptedQuote', acceptedQuote, isShowModal);
  return (
    <>
      <GoogleAnalytics gaId="G-47EYLN83WE" />
      <div className="h-6" />
      <div
        className={cx(
          'relative left-1/2 -translate-x-1/2',
          'w-auto lg:w-0',
          'flex flex-col items-center lg:block'
        )}
      >
        <div
          className={cx(
            'relative',
            'flex flex-col items-center lg:flex-row lg:items-start'
          )}
          style={{
            left: isLg ? 0 : -largeWidth,
            width: isXs
              ? '100%'
              : isLg
              ? DASHBOARD_WIDTH_RIGHT
              : DASHBOARD_WIDTH,
            gap: DASHBOARD_GAP,
          }}
        >
          <div
            style={{
              width: isXs ? '100%' : DASHBOARD_WIDTH_LEFT,
              padding: isXs ? '1rem' : '0',
            }}
          >
            <ComponentsDashboard isPainter={isPainter} />
          </div>
          <div
            style={{
              width: isXs ? '100%' : DASHBOARD_WIDTH_RIGHT,
              padding: isXs ? '1rem' : '0',
            }}
          >
            {acceptedQuote ? (
              <DashboardNotificationsQuoteAccepted
                painterId={acceptedQuote.painterId}
              />
            ) : (
              <>
                {userData && userData.prices && (
                  <DashboardClientQuotes />
                )}
              </>
            )}
          </div>
        </div>
        {selectedQuoteAmount>0 && isShowModal && (
          <DashboardModalQuoteAccepted
            closeButtonProps={{
              title: 'Close',
              onClick: handleCloseModal,
            }}
            checkoutButtonProps={{
              amount: selectedQuoteAmount * 0.1,
              painterId, // Make sure this is the correct painterId
              userImageId: selectedUserImage, // Make sure this is the correct userImageId
              userId: selectedUserImage,
            }}
          />
        )}
      </div>
    </>
  );
};

const DashboardWithSuspense: FC = () => (
  <Suspense fallback={<FallbacksLoading />}>
    <Dashboard />
  </Suspense>
);

export default DashboardWithSuspense;

// userImageList={userImageList}
// uploadStatus={uploadStatus}
// userData={userData}
// uploadProgress={uploadProgress}
// acceptedQuote={acceptedQuote}
// videoRef={videoRef}
// onAcceptQuote={onAcceptQuote}
// onQuoteChange={onQuoteChange}
// preferredPainterUserIds={
//   preferredPainterUserIds
// }
// agentInfo={agentInfo}
// selectedUserImage={selectedUserImage}
// isPainter={isPainter}
