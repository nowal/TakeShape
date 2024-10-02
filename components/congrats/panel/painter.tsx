import { useCongrats } from '@/components/congrats/hook';
import { PainterCard } from '@/components/painter/card';
import type { FC } from 'react';

export const CongratsPanelPainter: FC = () => {
  const congrats = useCongrats();
  const { painterId } = congrats;
  return (
    <div className="flex flex-col items-center text-gray-7 font-semibold">
      <>
        {painterId && (
          <div className="fill-column-white-sm">
            <PainterCard painterId={painterId} />
          </div>
        )}
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
