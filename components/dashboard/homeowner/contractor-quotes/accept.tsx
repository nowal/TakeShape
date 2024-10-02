import type { FC } from 'react';
import { IconsAcceptQuote } from '@/components/icons/accept-quote';
import { cx } from 'class-variance-authority';

export const DashboardHomeownerContractorQuotesAccept: FC = () => {
  return (
    <div
      className={cx(
        'flex flex-row items-center gap-3.5 text-xs font-medium text-gray-7',

        'px-5',
        'py-4',
        'border',
        'border-gray-11',
        'rounded-lg'
      )}
    >
      <IconsAcceptQuote />
      <span>
        To accept the quote you need to make a 10% deposit
        to secure contractors time through Stripe Payment.
      </span>
    </div>
  );
};
