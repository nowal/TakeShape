import type { FC } from 'react';
import { TextLayout } from '@/components/text/layout';
import { cx } from 'class-variance-authority';

export const AboutUsText: FC = () => {
  return (
    <div
      className={cx(
        'flex flex-col items-center w-full',
        'rounded-4xl bg-white-8',
        'pt-9 pb-10 sm:py-0',
        'px-7 sm:px-0 sm:pr-4',
        'text-center',
        'sm:bg-transparent',
        'sm:w-[538px]'
      )}
    >
      <TextLayout
        pretitle="About us"
        title="We Know the Headache of In-Home Estimates"
        subtitle="So We Built a Better Way"
        text={
          <>
            <p className="pt-8 text-left">
              We&apos;re Noah and Nicole. We were tired of
              not starting our home improvement projects
              because of the headache of finding people to
              help us. We started TakeShape in order to
              bridge the gap between homeowners and
              painters, helping both save time and money.
            </p>
            <p className="pt-4 text-left">
              As residents of Murfreesboro, we founded
              TakeShape with Middle Tennesseans in mind.
              We&apos;ve partnered with an extensive network
              of painters in the community, and are exicted
              to offer you the best experience for your
              painting needs.
            </p>
          </>
        }
      />
    </div>
  );
};
