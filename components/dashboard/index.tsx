import { DashboardHomeowner } from '@/components/dashboard/homeowner';
import { DashboardPainter } from '@/components/dashboard/painter';
import { useDashboard } from '@/context/dashboard/provider';
import { useViewport } from '@/context/viewport';
import type { FC } from 'react';

export const ComponentsDashboard: FC = () => {
  const dashboard = useDashboard();
  const viewport = useViewport();
  const { isPainter } = dashboard;
  if (!viewport.isDimensions) return null;
  if (isPainter) return <DashboardPainter />;
  return <DashboardHomeowner />;
};
