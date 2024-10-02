'use client';
import { cx } from 'class-variance-authority';
import {
  DASHBOARD_GAP,
  DASHBOARD_WIDTH,
  DASHBOARD_WIDTH_LEFT,
  DASHBOARD_WIDTH_RIGHT,
} from '@/components/dashboard/constants';
import { useDashboard } from '@/context/dashboard/provider';
import { useViewport } from '@/context/viewport';
import { TPropsWithChildren } from '@/types/dom/main';
import { FC } from 'react';

const resolveSideStyle = (
  isSingleColumn: boolean,
  width: number
) => ({
  width: isSingleColumn ? '100%' : width,
  padding: isSingleColumn ? '1rem' : '0',
});

type TProps = TPropsWithChildren<{
  first?: JSX.Element;
  second?: JSX.Element;
  
}>;
export const ComponentsDashboardShell: FC<TProps> = ({
  first,
  second,
  children,
}) => {
  const viewport = useViewport();
  const isLg = viewport.isDimensions && viewport.isLg;
  const isXs = viewport.isDimensions && viewport.isXs;
  const largeWidth =
    DASHBOARD_WIDTH_LEFT + DASHBOARD_GAP / 2;
  const isSingleColumn = isXs;
  const leftStyle = resolveSideStyle(
    isSingleColumn,
    DASHBOARD_WIDTH_LEFT
  );
  const rightStyle = resolveSideStyle(
    isSingleColumn,
    DASHBOARD_WIDTH_RIGHT
  );
  return (
    <div
      className={cx(
        'relative left-1/2 -translate-x-1/2',
        'w-auto lg:w-0',
        'mt-8',
        'flex flex-col items-center lg:block'
      )}
    >
      <div
        className={cx(
          'relative',
          'flex flex-col items-center lg:flex-row lg:items-start'
        )}
        style={{
          left: isLg || isSingleColumn ? 0 : -largeWidth,
          width: isSingleColumn
            ? '100%'
            : isLg
            ? DASHBOARD_WIDTH_RIGHT
            : DASHBOARD_WIDTH,
          gap: DASHBOARD_GAP,
        }}
      >
        {first && <div style={leftStyle}>{first}</div>}
        {second && <div style={rightStyle}>{second}</div>}
      </div>
      {children}
    </div>
  );
};
