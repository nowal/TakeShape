import { forwardRef, VideoHTMLAttributes } from 'react';

type TProps = VideoHTMLAttributes<HTMLVideoElement>;
const DashboardHomeownerVideoDisplay = forwardRef<
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
DashboardHomeownerVideoDisplay.displayName =
  'DashboardHomeownerVideoDisplay';
export { DashboardHomeownerVideoDisplay };
