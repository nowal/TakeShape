import type { FC } from 'react';
import Image from 'next/image';
import image from '@/public/landing/dream-room/index.png';
import imageLg from '@/public/landing/dream-room/lg.png';

import { useViewport } from '@/context/viewport';

const alt =
  'Dream Room Pic, Woman Adjusting Painting on Wall';

export const LandingDreamRoomImage: FC = () => {
  const viewport = useViewport();
  if (!viewport.isDimensions) return null;
  return (
    <div className="absolute inset-0 w-full bg-white overflow-hidden">
      {viewport.isLg ? (
        <Image
          src={imageLg.src}
          alt={alt}
          quality="100"
          fill
          objectFit="contain"
        />
      ) : (
        <Image
          src={image.src}
          alt={alt}
          quality="100"
          fill
          objectFit="cover"
          objectPosition="right top"
          style={{
            left: '25%',
          }}
        />
      )}
    </div>
  );
};
