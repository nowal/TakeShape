import { DashboardPainterQuotes } from '@/components/dashboard/painter/quotes';
import { DashboardPainterJob } from '@/components/dashboard/painter/quotes/job/available/form';
import { DashboardPainterWithSelect } from '@/components/dashboard/painter/with-select';
import { useDashboardPainter } from '@/context/dashboard/painter/provider';

export const DashboardPainter = () => {
  const { jobs } = useDashboardPainter();

  return (
    <DashboardPainterWithSelect>
      <DashboardPainterQuotes
        type="Available"
        jobs={jobs}
        JobInfoFc={DashboardPainterJob}
      />
    </DashboardPainterWithSelect>
  );
};
