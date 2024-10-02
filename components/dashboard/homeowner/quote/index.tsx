import { DashboardHomeownerVideo } from '@/components/dashboard/homeowner/video';
import { useDashboard } from '@/context/dashboard/provider';
import { cx } from 'class-variance-authority';
import type { FC } from 'react';
import { DashboardHomeownerQuoteButton } from '@/components/dashboard/homeowner/quote/button';
import { DashboardCard } from '@/components/dashboard/card';

export const DashboardHomeownerQuote: FC = () => {
  const dashboard = useDashboard();
  const { userData, acceptedQuote } = dashboard;
  if (acceptedQuote) return null;

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
      <DashboardHomeownerQuoteButton />
    </DashboardCard>
  );
};
