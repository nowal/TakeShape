import { InViewReplacersFadeUp } from '@/components/in-view/replacers/fade-up';
import { ReplacersFill } from '@/components/replacers/fill';
import { cx } from 'class-variance-authority';
import type { FC } from 'react';

type TProps = {
  title: string;
  description: string;
  PreviewFc: FC;
};
export const LandingBenefitsItem: FC<TProps> = ({
  title,
  description,
  PreviewFc,
}) => {
  return (
    <div
      className={cx(
        'flex flex-col items-stretch gap-7',
        'flex-col-reverse'
      )}
    >
      <div
        className={cx(
          'relative',
          'bg-white-8',
          'rounded-2xl xl:rounded-4xl',
          'pb-[100%] lg:pb-[64%]'
        )}
        style={{
          width: '100%',
        }}
      >
        <ReplacersFill>
          <div
            className="absolute inset-24 bg-pink opacity-10 xl:opacity-20"
            style={{ filter: 'blur(4.8rem)' }}
          />
        </ReplacersFill>
        <PreviewFc />
      </div>
      <InViewReplacersFadeUp>
        <h4 className="text-2xl font-bold text-black tight-02">
          {title}
        </h4>
        <div className="h-3" />
        <p className="text-base font-medium text-gray-7">
          {description}
        </p>
      </InViewReplacersFadeUp>
    </div>
  );
};
