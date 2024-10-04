import { DashboardHomeowner } from '@/components/dashboard/homeowner';
import { DashboardPainter } from '@/components/dashboard/painter';
import { ComponentsDashboardShell } from '@/components/dashboard/shell';
import { useAuth } from '@/context/auth/provider';
import { useDashboard } from '@/context/dashboard/provider';
import { useViewport } from '@/context/viewport';
import type { FC } from 'react';

export const ComponentsDashboard: FC = () => {
  const viewport = useViewport();
  const auth = useAuth();
  const { signIn } = auth;
  const dashboard = useDashboard();
  const { isPainter, isUserDataLoading } = dashboard;

  const isLoading =
    !viewport.isDimensions ||
    isUserDataLoading ||
    signIn.isSigningIn ||
    signIn.isAuthLoading;

  if (isLoading) return null;
  return (
    <ComponentsDashboardShell>
      {isPainter ? (
        <DashboardPainter />
      ) : (
        <DashboardHomeowner />
      )}
    </ComponentsDashboardShell>
  );
};
