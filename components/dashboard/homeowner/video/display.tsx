import { forwardRef, VideoHTMLAttributes } from 'react';

type TProps = VideoHTMLAttributes<HTMLVideoElement>;
export const DashboardHomeownerVideoDisplay = forwardRef<
  HTMLVideoElement,
  TProps
>((props, ref) => {
  return (
    <video
      controls
      playsInline
      muted
      ref={ref}
      {...props}
    />
  );
});
