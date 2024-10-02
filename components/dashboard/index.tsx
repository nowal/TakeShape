import { DashboardHomeowner } from '@/components/dashboard/homeowner';
import { DashboardPainter } from '@/components/dashboard/painter';
import type { FC } from 'react';

type TProps = {
  isPainter: boolean;
};
export const ComponentsDashboard: FC<TProps> = ({
  isPainter,
}) => {
  if (isPainter) return <DashboardPainter />;
  return <DashboardHomeowner />;
};
