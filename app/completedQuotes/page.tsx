'use client';
import { DashboardPainterJobs } from '@/components/dashboard/painter/jobs';
import { DashboardPreferences } from '@/components/dashboard/preferences';

const CompletedQuotes = () => {
  return (
    <DashboardPainterJobs
      typeKey="completed"
      JobInfoFc={DashboardPreferences}
    />
  );
};

export default CompletedQuotes;
