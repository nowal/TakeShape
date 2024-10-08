import type { FC } from 'react';
import { LandingDreamRoomImage } from '@/components/landing/dream-room/image';
import { LandingDreamRoomText } from '@/components/landing/dream-room/text';
import { cx } from 'class-variance-authority';

export const LandingDreamRoom: FC = () => {
  return (
    <div
      className={cx(
        'relative h-full w-full',
        'flex flex-row items-start',
        'pt-24',
        'lg:items-center lg:pt-0'
      )}
    >
      <LandingDreamRoomImage />
      <LandingDreamRoomText />
    </div>
  );
};
