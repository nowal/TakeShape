'use client';
import { LandingFaqTitle } from '@/components/landing/faq/title';
import { LandingFaqList } from '@/components/landing/faq/list';
import { LandingFaqImage } from '@/components/landing/faq/image';
import { cx } from 'class-variance-authority';

export const LandingFaq = () => {
  return (
    <div className="spacing-landing py-0 h-full lg:pb-20 lg:pt-0">
      <div
        className={cx(
          'flex flex-col w-full bg-white rounded-4xl h-full pb-0',
          'lg:flex-row lg:pb-20'
        )}
      >
        <LandingFaqImage />
        <LandingFaqTitle />
        <LandingFaqList />
      </div>
    </div>
  );
};

export default LandingFaq;
