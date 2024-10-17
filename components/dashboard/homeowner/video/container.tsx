import { FC } from 'react';
import { TDivProps } from '@/types/dom';
import { cx } from 'class-variance-authority';
import { useViewport } from '@/context/viewport';
import { DASHBOARD_VIDEO_WIDTH } from '@/components/dashboard/constants';

type TProps = TDivProps;
export const DashboardHomeownerVideoContainer: FC<
  TProps
> = ({ children, classValue, style, ...props }) => {
  const viewport = useViewport();
  const isXs = viewport.isDimensions && viewport.isXs;
  return (
    <div
      style={{
        width: isXs ? '100%' : DASHBOARD_VIDEO_WIDTH,
        ...style,
      }}
      className={cx(
        'rounded-xl overflow-hidden',
        classValue
      )}
      {...props}
    >
      {children}
    </div>
  );
};
