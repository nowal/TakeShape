import Image from 'next/image';
import { LandingBenefitsItem } from '@/components/landing/benefits/item/item';
import { cx } from 'class-variance-authority';
import type { FC } from 'react';
import { LandingBenefitsReceieveQuotes } from '@/components/landing/benefits/receive-quotes';
import { LandingBenefitsCongrats } from '@/components/landing/benefits/congrats';

export const LandingBenefits: FC = () => {
  return (
    <div className="flex flex-col items-center w-full h-full overflow-hidden">
      <div className="h-20" />
      <h3 className="typography-landing-subtitle--responsive">
        Benefits
      </h3>
      <div className="h-9" />
      <ul
        className={cx(
          'flex flex-col items-stretch w-full justify-stretch xl:flex-row',
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
              LandingBenefitsReceieveQuotes,
            ],
            [
              'Approve & Transform',
              'Review the quotes, approve the price, and get ready to enjoy the color you love.',
              LandingBenefitsCongrats,
            ],
          ] as const
        ).map(([title, description, ImageFc]) => {
          return (
            <li className="flex-1" key={title}>
              <LandingBenefitsItem
                key={title}
                title={title}
                description={description}
                ImageFc={ImageFc}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
};
