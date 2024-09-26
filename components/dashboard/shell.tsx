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
  left?: JSX.Element;
  right?: JSX.Element;
}>;
export const ComponentsDashboardShell: FC<TProps> = ({
  left,
  right,
  children,
}) => {
  const dashboard = useDashboard();
  const { isPainter } = dashboard;
  const viewport = useViewport();
  const isLg = viewport.isDimensions && viewport.isLg;
  const isXs = viewport.isDimensions && viewport.isXs;
  const largeWidth =
    DASHBOARD_WIDTH_LEFT + DASHBOARD_GAP / 2;
  const isSingleColumn = isPainter || isXs;
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
       {left && <div style={leftStyle}>{left}</div>}
       {right && <div style={rightStyle}>{right}</div>}
      </div>
      {children}
    </div>
  );
};
