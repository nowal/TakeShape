import type { FC } from 'react';
import { DashboardPricesItem } from '@/components/dashboard/prices/item';
import { TAcceptQuoteHandler, TAgentInfo, TPrice } from '@/types/types';

type TProps = {
  prices: TPrice[];
  agentInfo: TAgentInfo;
  preferredPainterUserIds: any;
  onAcceptQuote: TAcceptQuoteHandler
};
export const DashboardClientQuotes: FC<TProps> = ({
  prices,
  agentInfo,
  preferredPainterUserIds,
  onAcceptQuote
}) => {
  console.log('Rendering quotes with prices:', prices);
  console.log('Agent info:', agentInfo);

  

  if (!prices || prices.length === 0) {
    return (
      <div className="text-2xl mb-14 mt-8 font-bold">
        <p>Gathering Quotes...</p>
      </div>
    );
  }

  return (
    <div>
      {prices.map((price, index) => {
        const isPreferredPainter =
          preferredPainterUserIds.includes(price.painterId);
        console.log(
          `Price ${index}: Painter ID ${price.painterId}, isPreferredPainter: ${isPreferredPainter}`
        );
        if (isPreferredPainter) {
          console.log(
            'Rendering agent info for painter:',
            price.painterId
          );
        }
        return (
          <DashboardPricesItem
            isPreferredPainter={isPreferredPainter}
            acceptQuoteButtonProps={
              {
                onTap: () =>
                  onAcceptQuote(
                    price.painterId,
                    price.amount
                  ),
              }
              }
            agentInfo={agentInfo}
            {...price}
          />
        );
      })}
    </div>
  );
};
