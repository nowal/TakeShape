import type { FC } from 'react';
import { useDashboard } from '@/context/dashboard/provider';
import { DASHBOARD_VIDEO_WIDTH } from '@/components/dashboard/constants';
import { useViewport } from '@/context/viewport';

export const DashboardClientVideo: FC = () => {
  const dashboard = useDashboard();
  const { userData, videoRef } = dashboard;
  const viewport = useViewport();
  // const isSmall =
  //   viewport.isDimensions && viewport.width < 1024;
  const isVerySmall =
    viewport.isDimensions && viewport.width < 480;
  if (!userData) return null;
  return (
    <div
      style={{
        width: isVerySmall ? '100%' : DASHBOARD_VIDEO_WIDTH,
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
