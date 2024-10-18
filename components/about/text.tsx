import type { FC } from 'react';
//import { QuoteButton } from '@/components/buttons/quote/quoteButton';
import { cx } from 'class-variance-authority';

export const AboutText: FC = () => {
  return (
    <div
      className={cx(
        'flex flex-col items-center w-full pt-9',
        'rounded-t-4xl bg-white-8',
        'px-7',
        'text-center',
        'xl:items-start xl:text-left',
        'sm:px-0 sm:pt-0 sm:pr-4',
        'sm:rounded-t-0 sm:bg-transparent',
        'sm:w-[538px] '
      )}
    >
      {/*<span
        className={cx(
          'leading-none',
          'py-2.5 px-4 rounded-xl',
          'text-pink font-bold',
          'bg-white sm:bg-white-pink-4'
        )}
      >
        Hi There!
      </span>*/}
      <div className="h-3" />
      <h2
        className={cx(
          'typography-landing-subtitle--responsive',
          'px-0 xs:px-7 md:px-0'
        )}
      >
        We Know the Headache of In-Home Estimates
      </h2>
      <div className="h-4" />
      <div className="text-pink font-bold text-xl	">
        So We Built a Better Way
      </div>
      <div className="h-1" />
      <p className="text-gray-7">
        We&apos;re Noah and Nicole. We were tired of not starting our 
        home improvement projects because of the headache of finding people to help us.
        We started TakeShape in order to bridge the gap between homeowners and
        painters, helping both save time and money. As
        residents of Murfreesboro, we founded TakeShape with
        Middle Tennesseans in mind. We&apos;ve partnered with
        an extensive network of painters in the community,
        and are exicted to offer you the best experience
        for your painting needs.
      </p>
      <div className="h-8" />
      {/*<div className="hidden xl:flex">
        <QuoteButton />
      </div>*/}
    </div>
  );
};
