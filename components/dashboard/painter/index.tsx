import { DashboardPainterQuotes } from '@/components/dashboard/painter/quotes';
import { DashboardPainterWithSelect } from '@/components/dashboard/painter/with-select';

export const DashboardPainter = () => {
  return (
    <DashboardPainterWithSelect>
      <DashboardPainterQuotes />
    </DashboardPainterWithSelect>
  );
};
