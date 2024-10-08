import type { FC } from 'react';
import Image from 'next/image';
import image from '@/public/landing/faq/index.png';
import imageLg from '@/public/landing/faq/lg.png';
import { useViewport } from '@/context/viewport';
import { cx } from 'class-variance-authority';

const alt = 'FAQ Pic, Paint roller';

export const LandingFaqImage: FC = () => {
  const viewport = useViewport();
  if (!viewport.isDimensions) return null;
  return (
    <div
      className={cx(
        'absolute -top-28 left-1/2 -translate-x-1/2',
        'lg:top-4 lg:left-20 lg:translate-x-0'
      )}
      style={{
        width: 870,
        height: 785,
      }}
    >
      {viewport.isLg ? (
        <Image
          src={imageLg.src}
          alt={alt}
          quality="100"
          fill
          style={{ objectFit: 'contain' }}
          loading="lazy"
        />
      ) : (
        <Image
          src={image.src}
          alt={alt}
          quality="100"
          fill
          style={{ objectFit: 'contain' }}
          loading="lazy"
        />
      )}
    </div>
  );
};
