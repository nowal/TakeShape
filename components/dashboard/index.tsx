import { DashboardClient } from '@/components/dashboard/client';
import { DashboardPainter } from '@/components/dashboard/painter';
import type { FC } from 'react';

type TProps = {
  isPainter: boolean;
};
export const ComponentsDashboard: FC<TProps> = ({
  isPainter,
}) => {
  if (isPainter) return <DashboardPainter />;
  return <DashboardClient />;
};
