import { DashboardPainterQuotes } from '@/components/dashboard/painter/quotes';
import { DashboardPainterJobForm } from '@/components/dashboard/painter/quotes/job/form';
import { DashboardPainterWithSelect } from '@/components/dashboard/painter/with-select';
import { useDashboardPainter } from '@/context/dashboard/painter/provider';

export const DashboardPainter = () => {
  const { jobs } = useDashboardPainter();

  return (
    <DashboardPainterWithSelect>
      <DashboardPainterQuotes
        jobs={jobs}
        JobInfoFc={DashboardPainterJobForm}
      />
    </DashboardPainterWithSelect>
  );
};
