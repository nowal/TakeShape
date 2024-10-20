'use client';
import { HiringTipsTitle } from '@/components/hiring-tips/title';
import { HiringTipsList } from '@/components/hiring-tips/list';
import { HiringTipsImage } from '@/components/hiring-tips/image';
import { cx } from 'class-variance-authority';

export const ComponentsHiringTips = () => {
  return (
    <div className="spacing-landing py-0 h-full lg:pb-12 lg:pt-0">
      <div
        className={cx(
          'flex flex-col w-full bg-white rounded-4xl h-full pb-0',
          'lg:flex-row lg:pb-20'
        )}
      >
        <HiringTipsImage />
        <HiringTipsTitle />
        <HiringTipsList />
      </div>
    </div>
  );
};
