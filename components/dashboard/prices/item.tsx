import type { FC } from 'react';
import PainterCard from '@/components/painterCard';
import { TAgentInfo, TPrice } from '@/types/types';
import {
  ButtonsCvaButton,
  TButtonsCvaButtonProps,
} from '@/components/cva/button';

type TProps = TPrice & {
  isPreferredPainter: boolean;
  acceptQuoteButtonProps: Partial<TButtonsCvaButtonProps>;
  agentInfo: TAgentInfo;
};
export const DashboardPricesItem: FC<TProps> = ({
  isPreferredPainter,
  acceptQuoteButtonProps,
  agentInfo,
  ...price
}) => {
  const acceptQuoteTitle = 'Accept Quote';
  return (
    <div>
      <div className="quote-item flex flex-col sm:flex-row items-center justify-between mb-5 p-3 border border-gray-300 rounded shadow-md">
        <PainterCard painterId={price.painterId} />
        <div className="quote-details flex-1 flex flex-col sm:flex-row items-center justify-between pl-5 border-l-2 border-gray-300 gap-4">
          <div className="quote-info">
            <p className="text-lg font-bold">
              Quote:{' '}
              <span className="text-xl">
                ${price.amount.toFixed(2)}
              </span>
            </p>
            {price.invoiceUrl && (
              <a
                href={price.invoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                Invoice
              </a>
            )}
            {agentInfo && isPreferredPainter && (
              <div className="recommended flex items-center mt-2">
                <img
                  src={agentInfo.profilePictureUrl}
                  alt="Agent"
                  className="w-8 h-8 rounded-full mr-2"
                />
                <p className="text-sm text-green-600">
                  Recommended by {agentInfo.name}
                </p>
              </div>
            )}
          </div>
          <ButtonsCvaButton
            title={acceptQuoteTitle}
            className="button-green transition duration-300 mt-2 sm:mt-0"
            {...acceptQuoteButtonProps}
          >
            {acceptQuoteTitle}
          </ButtonsCvaButton>
        </div>
      </div>
    </div>
  );
};
