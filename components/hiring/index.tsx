'use client';
import { HiringFaqTitle } from '@/components/hiring/title';
import { HiringFaqList } from '@/components/hiring/list';
import { HiringFaqImage } from '@/components/hiring/image';
import { cx } from 'class-variance-authority';
import { ReplacersFill } from '@/components/replacers/fill';

export const HiringFaq = () => {
  return (
    <div className="spacing-landing py-0 h-full lg:pb-20 lg:pt-0">
      <div
        className={cx(
          'flex flex-col w-full bg-white rounded-4xl h-full pb-0',
          'lg:flex-row lg:pb-20'
        )}
      >
        <HiringFaqImage />
        <HiringFaqTitle />
        <HiringFaqList />
      </div>
    </div>
  );
};

export default HiringFaq;
