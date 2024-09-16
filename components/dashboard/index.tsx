import {
  DashboardClient,
  TDashboardClientProps,
} from '@/components/dashboard/client';
import { DashboardPainter } from '@/components/dashboard/painter';
import type { FC } from 'react';

type TProps = TDashboardClientProps & {
  isPainter: boolean;
};
export const ComponentsDashboard: FC<TProps> = ({
  isPainter,
  ...props
}) => {
  if (isPainter) return <DashboardPainter />;

  return <DashboardClient {...props} />;
};
