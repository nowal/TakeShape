import { InViewReplacersFadeUp } from '@/components/in-view/replacers/fade-up';
import { TPropsWithChildren } from '@/types/dom/main';
import type { FC } from 'react';

export const ComponentsAccordianTitle: FC<
  TPropsWithChildren
> = ({ children }) => {
  return (
    <div className="relative w-full">
      <div className="flex flex-col items-center pb-24 pt-0 w-full lg:py-14">
        <InViewReplacersFadeUp>
          <h3 className="typography-landing-subtitle--responsive max-w-[477px]">
            {children}
          </h3>
        </InViewReplacersFadeUp>
      </div>
    </div>
  );
};
