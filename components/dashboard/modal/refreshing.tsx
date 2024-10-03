import type { FC } from 'react';
import { IconsLoadingDeposit } from '@/components/icons/loading/deposit';
import { ComponentsPanel } from '@/components/panel';

export const DashboardModalRefreshing: FC = () => {
  return (
    <ComponentsPanel title={<IconsLoadingDeposit />}>
      <p>
        We are redericting you to Stripe. You&apos;ll be
        sent back here after your confirm your deposit.
      </p>
    </ComponentsPanel>
  );
};
