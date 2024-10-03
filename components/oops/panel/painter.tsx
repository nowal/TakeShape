import { useCongrats } from '@/components/congrats/hook';
import { FallbacksLoadingCircle } from '@/components/fallbacks/loading/circle';
import { NotificationsHighlight } from '@/components/notifications/highlight';
import { PainterCardData } from '@/components/painter/card/data';
import type { FC } from 'react';

export const CongratsPanelPainter: FC = () => {
  const congrats = useCongrats();
  const { isLoading, painterId, error } = congrats;
  return (
    <div className="flex flex-col items-center text-gray-7 font-semibold">
      {isLoading ? (
        <FallbacksLoadingCircle />
      ) : error ? (
        <NotificationsHighlight>
          <p className="text-red-500">{error}</p>
        </NotificationsHighlight>
      ) : (
        <>
          {painterId && (
            <PainterCardData painterId={painterId} />
          )}
        </>
      )}
    </div>
  );
};
