import { useDashboard } from '@/context/dashboard/provider';
import type { FC } from 'react';
import { DashboardHomeownerQuoteButton } from '@/components/dashboard/homeowner/quote/button';
import { DashboardCard } from '@/components/dashboard/card';
import { DashboardPreferences } from '@/components/dashboard/preferences';
import { TPropsWithChildren } from '@/types/dom/main';

type TProps = TPropsWithChildren
export const DashboardHomeownerQuote: FC<TProps> = ({children}) => {
  const dashboard = useDashboard();
  const { userData, acceptedQuote } =
    dashboard;
  return (
    <DashboardCard>
      {children}
      {userData?.reAgent && <div>{userData.reAgent}</div>}
      <>
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
      </>
    </DashboardCard>
  );
};
