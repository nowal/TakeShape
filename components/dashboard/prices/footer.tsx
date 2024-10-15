import { ButtonsCvaAnchor } from '@/components/cva/anchor';
import { ButtonsCvaButton } from '@/components/cva/button';
import { IconsLoading16White } from '@/components/icons/loading/16/white';
import { useDashboard } from '@/context/dashboard/provider';
import { TPrice } from '@/types';
import { cx } from 'class-variance-authority';
import type { FC } from 'react';

type TProps = TPrice;
export const DashboardPricesItemFooter: FC<TProps> = (
  price
) => {
  const dashboard = useDashboard();
  const { isAcceptQuoteSubmitting, onAcceptQuote } =
    dashboard;
  const acceptQuoteTitle = 'Accept';
  const invoiceTitle = 'Invoice';

  return (
    <div
      className={cx(
        'flex flex-row item-center gap-4',
        'px-6',
        'py-3.5'
      )}
    >
      <ButtonsCvaButton
        title={acceptQuoteTitle}
        intent="primary"
        size="xxs"
        isDisabled={isAcceptQuoteSubmitting}
        icon={{
          Leading: isAcceptQuoteSubmitting
            ? IconsLoading16White
            : null,
        }}
        onTap={() => {
          onAcceptQuote(price.painterId, price.amount);
        }}
      >
        <span className="text-sm">{acceptQuoteTitle}</span>
      </ButtonsCvaButton>
      {price.invoiceUrl && (
        <ButtonsCvaAnchor
          title={invoiceTitle}
          href={price.invoiceUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="text-sm font-bold">
            {invoiceTitle}
          </span>
        </ButtonsCvaAnchor>
      )}
    </div>
  );
};
