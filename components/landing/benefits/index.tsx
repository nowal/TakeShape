import { LandingBenefitsItem } from '@/components/landing/benefits/item/item';
import { cx } from 'class-variance-authority';
import type { FC } from 'react';

export const LandingBenefits: FC = () => {
  return (
    <div className="flex flex-col items-center w-full h-full overflow-hidden">
      <div className="h-20" />
      <h3 className="typography-landing-subtitle">
        Benefits
      </h3>
      <div className="h-9" />
      <ul
        className={cx(
          'flex flex-row justify-stretch',
          'gap-5 px-9'
        )}
      >
        {(
          [
            [
              'Upload Your Video',
              'Capture a video of your space and upload it. We only need 30 seconds per room.',
            ],
            [
              'Receive Quotes',
              'Local painters will see your video and provide you with their best price.',
            ],
            [
              'Approve & Transform',
              'Review the quotes, approve the price, and get ready to enjoy the color you love.',
            ],
          ] as const
        ).map(
          (
            [title, description],
            index,
            { length: count }
          ) => {
            return (
              <li
                className="flex-1"
                key={title}
                style={{
                  width: `${(index / count) * 100}%`,
                }}
              >
                <LandingBenefitsItem
                  key={title}
                  title={title}
                  description={description}
                  index={index}
                />
              </li>
            );
          }
        )}
      </ul>
    </div>
  );
};
