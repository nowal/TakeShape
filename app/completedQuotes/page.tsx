'use client';
import { DashboardPainterJobs } from '@/components/dashboard/painter/jobs';
import { DashboardPreferences } from '@/components/dashboard/preferences';
import { useDashboardPainterNavigatingDone } from '@/context/dashboard/painter/navigating-done';

const CompletedQuotes = () => {
  useDashboardPainterNavigatingDone();

  return (
    <DashboardPainterJobs
      typeKey="completed"
      JobInfoFc={DashboardPreferences}
    />
  );
};

export default CompletedQuotes;
