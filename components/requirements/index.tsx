'use client';
import { RequirementsFaqTitle } from '@/components/requirements/title';
import { RequirementsFaqList } from '@/components/requirements/list';
import { RequirementsFaqImage } from '@/components/requirements/image';
import { cx } from 'class-variance-authority';

export const ComponentsRequirements = () => {
  return (
    <div className="spacing-landing py-0 h-full lg:pb-12 lg:pt-0">
      <div
        className={cx(
          'flex flex-col w-full bg-white rounded-4xl h-full pb-0',
          'lg:flex-row lg:pb-20'
        )}
      >
        <RequirementsFaqImage />
        <RequirementsFaqTitle />
        <RequirementsFaqList />
      </div>
    </div>
  );
};

export default ComponentsRequirements;
