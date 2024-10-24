'use client';
import { FC, Suspense } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import { FallbacksLoadingFill } from '@/components/fallbacks/loading';
import { ComponentsDashboard } from '@/components/dashboard';
import { useAuthNavigateHome } from '@/hooks/auth/navigate/home';

const Dashboard = () => {
  useAuthNavigateHome();

  return (
    <>
      <GoogleAnalytics gaId="G-47EYLN83WE" />
      <ComponentsDashboard />
    </>
  );
};

const DashboardWithSuspense: FC = () => (
  <Suspense fallback={<FallbacksLoadingFill />}>
    <Dashboard />
  </Suspense>
);

export default DashboardWithSuspense;
