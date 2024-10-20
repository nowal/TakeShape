'use client';
import { ComponentsAccordian } from '@/components/accordian';
import { REQUIREMENTS_COPY_ROWS } from '@/components/requirements/constants';

export const ComponentsRequirements = () => {
  return (
    <ComponentsAccordian
      title="Painter Requirements"
      items={REQUIREMENTS_COPY_ROWS}
    />
  );
};

export default ComponentsRequirements;
