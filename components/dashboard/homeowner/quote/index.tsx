import { DashboardHomeownerVideo } from '@/components/dashboard/homeowner/video';
import { useDashboard } from '@/context/dashboard/provider';
import type { FC } from 'react';
import { DashboardHomeownerQuoteButton } from '@/components/dashboard/homeowner/quote/button';
import { DashboardCard } from '@/components/dashboard/card';
import { DashboardPreferences } from '@/components/dashboard/preferences';

export const DashboardHomeownerQuote: FC = () => {
  const dashboard = useDashboard();
  const { userData, acceptedQuote } = dashboard;
  return (
    <DashboardCard>
      <DashboardHomeownerVideo />
      {userData && <div>{userData.reAgent}</div>}
      {acceptedQuote ? (
        <>
          {userData ? (
            <DashboardPreferences
              {...userData.paintPreferences}
              specialRequests={userData.specialRequests}
              moveFurniture={userData.moveFurniture}
              laborAndMaterial={userData.laborAndMaterial}
            >
              Your Preferences
            </DashboardPreferences>
          ) : null}
        </>
      ) : (
        <DashboardHomeownerQuoteButton />
      )}
    </DashboardCard>
  );
};
