import type { FC } from 'react';
import { useDashboard } from '@/context/dashboard/provider';

export const DashboardClientVideo: FC = () => {
  const dashboard = useDashboard();
  const { userData, videoRef } = dashboard;
  if (!userData) return null;
  return (
    <div
      style={{
        width: 345,
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
