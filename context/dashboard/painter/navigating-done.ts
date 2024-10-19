import { useDashboardPainter } from '@/context/dashboard/painter/provider';
import { useEffect } from 'react';

export const useDashboardPainterNavigatingDone = () => {
  const dashboardPainter = useDashboardPainter();
  const { onNavigatingDone } = dashboardPainter;
  useEffect(() => {
    onNavigatingDone();
  }, []);
};
