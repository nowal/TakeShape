import type { FC } from 'react';
import Image from 'next/image';
import image from '@/public/landing/dream-room/index.png';
import imageLg from '@/public/landing/dream-room/lg.png';

import { useViewport } from '@/context/viewport';
import { cx } from 'class-variance-authority';

const alt =
  'Dream Room Pic, Woman Adjusting Painting on Wall';

export const LandingDreamRoomImage: FC = () => {
  const viewport = useViewport();
  if (!viewport.isDimensions) return null;
  return (
    <div
      className={cx(
        'absolute inset-0 w-full h-full overflow-hidden'
      )}
    >
      {viewport.isLg ? (
        <Image
          src={imageLg.src}
          alt={alt}
          quality="90"
          fill
          style={{ objectFit: 'contain', objectPosition:'center bottom' }}
          loading="lazy"
        />
      ) : (
        <Image
          src={image.src}
          alt={alt}
          quality="90"
          fill
          style={{
            objectFit: 'contain',
            objectPosition: 'right top',
          }}
          loading="lazy"
        />
      )}
    </div>
  );
};
