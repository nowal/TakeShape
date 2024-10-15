import { DashboardPainterQuotes } from '@/components/dashboard/painter/quotes';
import { DashboardPainterJobAvailable } from '@/components/dashboard/painter/quotes/job/available';
import { DashboardPainterWithSelect } from '@/components/dashboard/painter/with-select';
import { useDashboardPainter } from '@/hooks/pages/dashboard/painter';

export const DashboardPainter = () => {
  const { jobs } = useDashboardPainter();

  return (
    <DashboardPainterWithSelect>
      <DashboardPainterQuotes
        type="Available"
        jobs={jobs}
        JobInfoFc={DashboardPainterJobAvailable}
      />
    </DashboardPainterWithSelect>
  );
};
