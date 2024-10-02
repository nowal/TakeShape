import { useCongrats } from '@/components/congrats/hook';
import { FallbacksLoadingCircle } from '@/components/fallbacks/loading/circle';
import { NotificationsHighlight } from '@/components/notifications/highlight';
import { PainterCard } from '@/components/painter-card';
import type { FC } from 'react';

export const CongratsPanelPainter: FC = () => {
  const congrats = useCongrats();
  const { isLoading, painterId, error } = congrats;
  return (
    <div className="flex flex-col items-center text-gray-7 font-semibold">
      <>
        {painterId && <PainterCard painterId={painterId} />}
      </>
      {/* {isLoading ? (
        <FallbacksLoadingCircle />
      ) : error ? (
        <NotificationsHighlight>
          {error}
        </NotificationsHighlight>
      ) : (
        <>
          {painterUserId && (
            <PainterCard painterId={painterUserId} />
          )}
        </>
      )} */}
    </div>
  );
};
