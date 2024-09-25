import Image from 'next/image';
import { LandingBenefitsItem } from '@/components/landing/benefits/item/item';
import { useViewport } from '@/context/viewport';
import { cx } from 'class-variance-authority';
import type { FC } from 'react';

export const LandingBenefits: FC = () => {
  const viewport = useViewport();

  return (
    <div className="flex flex-col items-center w-full h-full overflow-hidden">
      <div className="h-20" />
      <h3 className="typography-landing-subtitle--responsive">
        Benefits
      </h3>
      <div className="h-9" />
      <ul
        className={cx(
          'flex flex-col items-stretch w-full justify-stretch sm:flex-row',
          'gap-5 px-9'
        )}
      >
        {(
          [
            [
              'Upload Your Video',
              'Capture a video of your space and upload it. We only need 30 seconds per room.',
              () => (
                <Image
                  key="0"
                  alt="Upload Your Video"
                  src={`/landing/benefits/${'0'}.png`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: 'cover' }}
                />
              ),
            ],
            [
              'Receive Quotes',
              'Local painters will see your video and provide you with their best price.',
              () => (
                <div className="absolute inset-0 bg-red">
                  <div>hello</div>
                </div>
              ),
            ],
            [
              'Approve & Transform',
              'Review the quotes, approve the price, and get ready to enjoy the color you love.',
              () => (
                <Image
                  key="2"
                  alt="Receive Quotes"
                  src={`/landing/benefits/${'2'}.png`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: 'cover' }}
                />
              ),
            ],
          ] as const
        ).map(
          (
            [title, description, ImageFc],
            index,
            { length: count }
          ) => {
            return (
              <li
                className="flex-1"
                key={title}
                style={{
                  width:
                    viewport.isDimensions && viewport.isLg
                      ? '100%'
                      : `${(index / count) * 100}%`,
                }}
              >
                <LandingBenefitsItem
                  key={title}
                  title={title}
                  description={description}
                  ImageFc={ImageFc}
                />
              </li>
            );
          }
        )}
      </ul>
    </div>
  );
};
