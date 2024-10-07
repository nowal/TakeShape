import { DashboardHomeownerVideo } from '@/components/dashboard/homeowner/video';
import { useDashboard } from '@/context/dashboard/provider';
import { cx } from 'class-variance-authority';
import type { FC } from 'react';
import { DashboardHomeownerQuoteButton } from '@/components/dashboard/homeowner/quote/button';
import { DashboardCard } from '@/components/dashboard/card';
import { DashboardPreferences } from '@/components/dashboard/preferences';

export const DashboardHomeownerQuote: FC = () => {
  const dashboard = useDashboard();
  const { userData, acceptedQuote } = dashboard;
  console.log(userData, acceptedQuote);
  return (
    <DashboardCard>
      <DashboardHomeownerVideo />
      <div>
        <h4
          className={cx(
            'text-black',
            'font-semibold font-base font-open-sans',
            'w-full',
            'truncate'
          )}
        >
          {userData?.title}
        </h4>
        <div>{userData?.reAgent}</div>
      </div>

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
