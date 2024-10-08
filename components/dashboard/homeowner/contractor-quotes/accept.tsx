import type { FC } from 'react';
import { DashboardHomeownerContractorQuotesBase } from '@/components/dashboard/homeowner/contractor-quotes/base';
import { IconsAcceptQuote } from '@/components/icons/accept-quote';

export const DashboardHomeownerContractorQuotesAccept: FC =
  () => {
    return (
      <DashboardHomeownerContractorQuotesBase
        Icon={IconsAcceptQuote}
        long="To accept the quote you need to make a 10% deposit to secure contractors time through Stripe Payment."
      />
    );
  };
