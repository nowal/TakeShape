import type { FC } from 'react';
import { DashboardHomeownerContractorQuotesBase } from '@/components/dashboard/homeowner/contractor-quotes/base';
import { IconsAcceptQuote } from '@/components/icons/accept-quote';

export const DashboardHomeownerContractorQuotesEmpty: FC =
  () => {
    return (
      <DashboardHomeownerContractorQuotesBase
        Icon={IconsAcceptQuote}
        long="No quotes"
      />
    );
  };
