import type { FC } from 'react';
import { LandingDreamRoomImage } from '@/components/landing/dream-room/image';
import { LandingDreamRoomText } from '@/components/landing/dream-room/text';

export const LandingDreamRoom: FC = () => {
  return (
    <div className="relative flex flex-row items-center grow h-full w-full bg-white-4">
      <LandingDreamRoomImage />
      <LandingDreamRoomText />
    </div>
  );
};
