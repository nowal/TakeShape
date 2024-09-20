import type { FC } from 'react';
import Image from 'next/image';
import happyPic from '@/public/landing/dream-room.png';

export const LandingDreamRoomImage: FC = () => {
  return (
    <div className="absolute inset-0 w-full overflow-hidden">
      <Image
        src={happyPic.src}
        alt="Happy Pic"
        quality="100"
        layout="fill"
        style={{
          left: '25%',
        }}
      />
    </div>
  );
};
