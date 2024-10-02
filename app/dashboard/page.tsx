'use client';
import { FC, Suspense } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import { FallbacksLoading } from '@/components/fallbacks/loading';
import { ComponentsDashboard } from '@/components/dashboard';

const Dashboard = () => {
  return (
    <>
      <GoogleAnalytics gaId="G-47EYLN83WE" />
      <ComponentsDashboard />
    </>
  );
};

const DashboardWithSuspense: FC = () => (
  <Suspense fallback={<FallbacksLoading />}>
    <Dashboard />
  </Suspense>
);

export default DashboardWithSuspense;
