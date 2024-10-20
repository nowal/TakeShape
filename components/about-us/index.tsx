import type { FC } from 'react';
import { AboutUsText } from '@/components/about-us/text';

export const ComponentsAboutUs: FC = () => {
  return (
    <div className="spacing-landing pb-20 h-full mt-8">
      <div className="relative flex flex-col items-center justify-between h-full w-full">
        <AboutUsText />
      </div>
    </div>
  );
};
