import { DashboardPainterQuotes } from '@/components/dashboard/painter/quotes';
import { DashboardPainterJobAvailable } from '@/components/dashboard/painter/quotes/job/available';
import { DashboardPainterWithSelect } from '@/components/dashboard/painter/with-select';
import { useDashboardPainter } from '@/context/dashboard/painter/provider';

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
