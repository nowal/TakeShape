import type { FC } from 'react';
import { IconsLoadingDeposit } from '@/components/icons/loading/deposit';
import { ComponentsModalPanel } from '@/components/modal/panel';

export const DashboardModalRefreshing: FC = () => {
  return (
    <ComponentsModalPanel title={<IconsLoadingDeposit />}>
      <p>
        We are redericting you to Stripe. You&apos;ll be
        sent back here after your confirm your deposit.
      </p>
    </ComponentsModalPanel>
  );
};
