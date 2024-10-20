'use client';
import { ComponentsAccordian } from '@/components/accordian';
import { HIRING_COPY_ROWS } from '@/components/hiring-tips/constants';

export const ComponentsHiringTips = () => {
  return (
    <ComponentsAccordian
      title="Hiring Tips"
      items={HIRING_COPY_ROWS}
    />
  );
};

export default ComponentsHiringTips;
