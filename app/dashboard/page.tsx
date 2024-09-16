'use client';
import { FC, Suspense } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import { FallbacksLoading } from '@/components/fallbacks/loading';
import { DashboardModalQuoteAccepted } from '@/components/dashboard/modal/quote-accepted';
import { useDashboard } from '@/components/dashboard/hooks';
import { ComponentsDashboard } from '@/components/dashboard';

const Dashboard = () => {
  const dashboard = useDashboard();
  const {
    isShowModal,
    isPainter,
    selectedQuote,
    userImageList,
    uploadStatus,
    userData,
    uploadProgress,
    acceptedQuote,
    videoRef,
    onAcceptQuote,
    preferredPainterUserIds,
    agentInfo,
    selectedUserImage,
    dispatchShowModal,
  } = dashboard;
  const handleCloseModal = () => dispatchShowModal(false);

  return (
    <div className="relative left-1/2 w-1 bg-red">
      <GoogleAnalytics gaId="G-47EYLN83WE" />
      <ComponentsDashboard
        userImageList={userImageList}
        uploadStatus={uploadStatus}
        userData={userData}
        uploadProgress={uploadProgress}
        acceptedQuote={acceptedQuote}
        videoRef={videoRef}
        onAcceptQuote={onAcceptQuote}
        preferredPainterUserIds={preferredPainterUserIds}
        agentInfo={agentInfo}
        selectedUserImage={selectedUserImage}
        isPainter={isPainter}
      />
      {acceptedQuote && isShowModal && (
        <DashboardModalQuoteAccepted
          closeButtonProps={{
            title: 'Close',
            onClick: handleCloseModal,
          }}
          checkoutButtonProps={{
            amount: selectedQuote * 0.1,
            painterId: acceptedQuote.painterId, // Make sure this is the correct painterId
            userImageId: selectedUserImage, // Make sure this is the correct userImageId
            userId: selectedUserImage,
          }}
        />
      )}
    </div>
  );
};

const DashboardWithSuspense: FC = () => (
  <Suspense fallback={<FallbacksLoading />}>
    <Dashboard />
  </Suspense>
);

export default DashboardWithSuspense;
