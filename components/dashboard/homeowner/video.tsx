import type { FC } from 'react';
import { useDashboard } from '@/context/dashboard/provider';
import { DASHBOARD_VIDEO_WIDTH } from '@/components/dashboard/constants';
import { useViewport } from '@/context/viewport';

export const DashboardHomeownerVideo: FC = () => {
  const dashboard = useDashboard();
  const { userData, videoRef } = dashboard;
  const viewport = useViewport();
  const isXs =
    viewport.isDimensions && viewport.isXs;
  if (!userData?.video) return null;
  return (
    <div
      style={{
        width: isXs ? '100%' : DASHBOARD_VIDEO_WIDTH,
      }}
      className="rounded-xl overflow-hidden"
    >
      <video
        controls
        playsInline
        muted={true}
        ref={videoRef}
        src={`${userData.video}#t=0.001`}
        className="video"
        style={{ width: '100%', maxWidth: '100%' }}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            videoRef.current.playbackRate = 1.0;
          }
        }}
      />
    </div>
  );
};
