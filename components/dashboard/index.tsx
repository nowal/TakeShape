import { DashboardHomeowner } from '@/components/dashboard/homeowner';
import { DashboardPainter } from '@/components/dashboard/painter';
import { useAuth } from '@/context/auth/provider';
import { useDashboard } from '@/context/dashboard/provider';
import { useViewport } from '@/context/viewport';
import type { FC } from 'react';

export const ComponentsDashboard: FC = () => {
  const viewport = useViewport();
  const auth = useAuth();
  const {
    signIn,
    signUp,
    isSignOutSubmitting,
    isAuthLoading,
  } = auth;
  const dashboard = useDashboard();
  const { isPainter, isUserDataLoading } = dashboard;
  const isReady =
    viewport.isDimensions &&
    !isUserDataLoading &&
    !signIn.isSignInSubmitting &&
    !isSignOutSubmitting &&
    !signUp.isSignUpSubmitting &&
    !isAuthLoading;

  if (!isReady) return null;

  return (
    <>
      {isPainter ? (
        <DashboardPainter />
      ) : (
        <DashboardHomeowner />
      )}
    </>
  );
};
