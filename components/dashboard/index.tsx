import { DashboardHomeowner } from '@/components/dashboard/homeowner';
import { DashboardPainter } from '@/components/dashboard/painter';
import { useDashboard } from '@/context/dashboard/provider';
import type { FC } from 'react';

export const ComponentsDashboard: FC = () => {
  const dashboard = useDashboard();
  const { isPainter } = dashboard;
  if (isPainter) return <DashboardPainter />;
  return <DashboardHomeowner />;
};
