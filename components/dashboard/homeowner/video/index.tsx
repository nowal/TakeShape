import type { FC } from 'react';
import { useDashboard } from '@/context/dashboard/provider';
import { DASHBOARD_VIDEO_WIDTH } from '@/components/dashboard/constants';
import { useViewport } from '@/context/viewport';
import { NotificationsInlineHighlight } from '@/components/notifications/inline/highlight';
import { DashboardHomeownerVideoDisplay } from '@/components/dashboard/homeowner/video/display';
import { DashboardHomeownerVideoContainer } from '@/components/dashboard/homeowner/video/container';

export const DashboardHomeownerVideo: FC = () => {
  const dashboard = useDashboard();
  const {
    userData,
    videoRef,
    uploadStatus,
    dispatchVideoLoading,
  } = dashboard;

  const handleLoadedData = () => {
    dispatchVideoLoading(false);
  };
  if (!userData) return null;
  if (!userData.video && uploadStatus !== 'uploading')
    return (
      <NotificationsInlineHighlight>
        No video uploaded
      </NotificationsInlineHighlight>
    );

  return (
    <DashboardHomeownerVideoContainer>
      <DashboardHomeownerVideoDisplay
        ref={videoRef}
        src={`${userData.video}#t=0.001`}
        style={{ width: '100%', maxWidth: '100%' }}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            videoRef.current.playbackRate = 1.0;
          }
        }}
        onLoadedData={handleLoadedData}
      />
    </DashboardHomeownerVideoContainer>
  );
};
