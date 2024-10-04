import { cx } from 'class-variance-authority';
import type { FC } from 'react';

type TProps = {
  title: string;
  description: string;
  ImageFc: FC;
};
export const LandingBenefitsItem: FC<TProps> = ({
  title,
  description,
  ImageFc,
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
          'rounded-2xl xl:rounded-4xl'
        )}
        style={{
          width: '100%',
          paddingBottom: '64%',
        }}
      >
        <ImageFc />
      </div>
      <div>
        <h4 className="text-2xl font-bold text-black tight-02">
          {title}
        </h4>
        <div className="h-3" />
        <p className="text-base font-medium text-gray-7">
          {description}
        </p>
      </div>
    </div>
  );
};