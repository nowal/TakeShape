import type { FC } from 'react';
import { InViewReplacersFadeUp } from '@/components/in-view/replacers/fade-up';

type TProps = { index: number; title: string };
export const ComponentsAccordianItemTitle: FC<TProps> = ({
  title,
  index,
}) => {
  return (
    <InViewReplacersFadeUp
      fadeUpProps={{
        delay: index * 0.1 + 0.1,
      }}
    >
      <div className="text-left">{title}</div>
    </InViewReplacersFadeUp>
  );
};
